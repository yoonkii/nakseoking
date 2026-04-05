"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Chalkboard from "@/components/game/Chalkboard";
import PlayerBar from "@/components/game/PlayerBar";
import CaughtOverlay from "@/components/game/CaughtOverlay";
import CountdownOverlay from "@/components/game/CountdownOverlay";
import ScoringOverlay from "@/components/game/ScoringOverlay";
import ScoringReveal from "@/components/game/ScoringReveal";
import ShareCode from "@/components/game/ShareCode";
import ResultScreen from "@/components/game/ResultScreen";
import DrawingCanvas from "@/components/game/DrawingCanvas";
import { useGameLoop } from "@/lib/game/useGameLoop";
import type { RoundResult } from "@/lib/game/types";
import type { DrawingCanvasHandle } from "@/components/game/DrawingCanvas";
import type { PlayerData } from "@/lib/supabase/rooms";
import {
  playWarningSound, playDangerSound, playReliefSound,
  playCaughtSound, playSubmitSound, unlockAudio,
} from "@/lib/game/sounds";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = (params.roomId as string)?.toUpperCase() || "TEST";
  const nickname = searchParams.get("nickname") || "플레이어";
  const isSingle = searchParams.get("mode") === "single" || roomCode === "SOLO";
  const supabaseRoomId = searchParams.get("room");

  const {
    gameState, teacherState, caught, showRelief,
    startRound, onStroke, submitDrawing, resetGame, prepareRound,
  } = useGameLoop({ nickname, totalRounds: 5 });

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [latestResult, setLatestResult] = useState<RoundResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"lobby" | "countdown" | "playing" | "scoring" | "result">("lobby");
  const [pendingKeyword, setPendingKeyword] = useState<{ word: string; emoji: string } | null>(null);
  const [pendingRoundNum, setPendingRoundNum] = useState(1);
  const pendingPreparedRef = useRef<ReturnType<typeof prepareRound> | null>(null);

  // Supabase multiplayer state
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerData[]>([]);

  // Load online players if multiplayer
  useEffect(() => {
    if (isSingle || !supabaseRoomId) return;

    let unsub: { unsubscribe: () => void } | null = null;

    (async () => {
      try {
        const { getRoomPlayers, subscribeToPlayers } = await import("@/lib/supabase/rooms");
        const players = await getRoomPlayers(supabaseRoomId);
        setOnlinePlayers(players);

        unsub = subscribeToPlayers(supabaseRoomId, (updated) => {
          setOnlinePlayers(updated);
        });
      } catch {}
    })();

    return () => { unsub?.unsubscribe(); };
  }, [isSingle, supabaseRoomId]);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || !gameState.currentRound) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - gameState.currentRound!.startedAt) / 1000;
      setTimer(Math.max(0, Math.ceil(60 - elapsed)));
    }, 100);
    return () => clearInterval(interval);
  }, [phase, gameState.currentRound]);

  // Sound effects
  const prevStateRef = useRef(teacherState);
  useEffect(() => {
    if (phase !== "playing") return;
    if (prevStateRef.current !== teacherState) {
      if (teacherState === "tell") playWarningSound();
      if (teacherState === "danger") playDangerSound();
      prevStateRef.current = teacherState;
    }
  }, [teacherState, phase]);
  useEffect(() => { if (showRelief && phase === "playing") playReliefSound(); }, [showRelief, phase]);
  useEffect(() => { if (caught) playCaughtSound(); }, [caught]);

  // Detect round end → go to scoring reveal first
  useEffect(() => {
    if (gameState.results.length > 0 && !gameState.currentRound && phase === "playing") {
      setLatestResult(gameState.results[gameState.results.length - 1]);
      setPhase("scoring");
    }
  }, [gameState.results, gameState.currentRound, phase]);

  // Start game: unlock audio, prepare round data, show countdown, then start with SAME data
  const handleStartGame = useCallback(() => {
    unlockAudio();
    const prepared = prepareRound();
    pendingPreparedRef.current = prepared;
    setPendingKeyword(prepared.keyword);
    setPendingRoundNum(prepared.roundNumber);
    setPhase("countdown");
  }, [prepareRound]);

  const handleCountdownDone = useCallback(() => {
    setPhase("playing");
    canvasRef.current?.clear();
    setTimer(60);
    // Pass the same prepared data so keyword matches what was shown in countdown
    startRound(pendingPreparedRef.current ?? undefined);
    pendingPreparedRef.current = null;
  }, [startRound]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    playSubmitSound();

    let imageBase64: string | undefined;
    try {
      const img = await canvasRef.current?.exportImage();
      if (img) {
        imageBase64 = img;
        console.log(`[submit] Canvas exported: ${img.length} chars`);
      } else {
        console.warn("[submit] Canvas export returned null (empty canvas?)");
      }
    } catch (e) {
      console.error("[submit] Canvas export error:", e);
    }

    await submitDrawing(imageBase64);
    setSubmitting(false);
  }, [submitDrawing, submitting]);

  const handleNextRound = useCallback(() => {
    const prepared = prepareRound();
    pendingPreparedRef.current = prepared;
    setPendingKeyword(prepared.keyword);
    setPendingRoundNum(prepared.roundNumber);
    setPhase("countdown");
  }, [prepareRound]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setPhase("lobby");
    setShowResult(false);
    setLatestResult(null);
  }, [resetGame]);

  // Clear canvas only when a NEW round starts (not on re-renders)
  const lastClearedRound = useRef(0);
  useEffect(() => {
    if (gameState.currentRound && gameState.currentRound.number !== lastClearedRound.current) {
      lastClearedRound.current = gameState.currentRound.number;
      // Small delay to let tldraw fully initialize
      setTimeout(() => canvasRef.current?.clear(), 100);
    }
  }, [gameState.currentRound]);

  const borderColor =
    teacherState === "danger" ? "var(--danger)"
    : teacherState === "tell" ? "var(--warning)"
    : showRelief ? "var(--safe)"
    : "transparent";

  // Merge local + online players for display
  const displayPlayers = onlinePlayers.length > 0
    ? onlinePlayers.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        status: p.status as "alive" | "out" | "spectating",
        isHost: p.is_host,
        activity: ("stopped" as const),
        score: 0,
      }))
    : gameState.players;

  // === LOBBY ===
  if (phase === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 select-none">
        <h1 className="font-jua text-3xl mb-4">낙서왕 ✏️</h1>

        {!isSingle && <ShareCode code={roomCode} />}

        {isSingle && (
          <div className="text-sm mb-2 px-4 py-2 rounded-[4px]" style={{ background: "#fff3cd", color: "#856404" }}>
            🎯 혼자 연습 모드
          </div>
        )}

        <p className="text-sm mt-3 mb-6" style={{ color: "var(--muted)" }}>
          {displayPlayers.length}명 참가 중
        </p>

        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {displayPlayers.map((p) => (
            <div key={p.id} className="text-center">
              <div
                className="w-12 h-12 rounded-full border-2 border-[var(--text)] flex items-center justify-center text-xl mx-auto"
                style={{ background: "#d4edda" }}
              >
                {p.nickname === nickname ? "나" : p.avatar}
              </div>
              <div className="text-xs mt-1">{p.nickname === nickname ? "나" : p.nickname}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartGame}
          className="text-white border-[3px] border-[var(--text)] rounded-[4px] px-12 py-4 font-jua text-xl active:scale-95 transition-transform"
          style={{ background: "var(--safe)" }}
        >
          게임 시작! 🎮
        </button>
      </div>
    );
  }

  // === COUNTDOWN ===
  if (phase === "countdown") {
    return (
      <CountdownOverlay
        active={true}
        keyword={pendingKeyword}
        roundNumber={pendingRoundNum}
        onComplete={handleCountdownDone}
      />
    );
  }

  // === SCORING REVEAL ===
  if (phase === "scoring" && latestResult) {
    return (
      <ScoringReveal
        result={latestResult}
        onComplete={() => setPhase("result")}
      />
    );
  }

  // === RESULT ===
  if (phase === "result" && latestResult) {
    return (
      <ResultScreen
        result={latestResult}
        isFinalRound={gameState.roundNumber >= gameState.totalRounds}
        onNextRound={handleNextRound}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // === GAMEPLAY ===
  return (
    <div
      className="flex flex-col min-h-screen max-w-[500px] mx-auto w-full select-none"
      style={{
        border: `4px solid ${borderColor}`,
        transition: "border-color 200ms ease-out",
      }}
    >
      <CaughtOverlay visible={caught} />
      <ScoringOverlay visible={submitting} />

      {/* Top bar */}
      <div
        className="flex justify-between items-center px-3 py-2 border-b-2 border-[var(--text)] text-sm font-bold"
        style={{ background: "#e8e0c8" }}
      >
        <span className="font-jua">ROUND {gameState.roundNumber}/{gameState.totalRounds}</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>
          {gameState.players.filter((p) => p.status === "alive").length}/{gameState.players.length} 생존
        </span>
        <span className="font-jua text-lg" style={{ color: timer <= 10 ? "var(--danger)" : "var(--text)" }}>
          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </span>
      </div>

      <Chalkboard teacherState={teacherState} />

      {gameState.currentRound && (
        <div
          className="text-center py-2 mx-2 mt-2 rounded-[4px]"
          style={{ background: "#fff3cd", border: "2px dashed var(--warning)" }}
        >
          <div className="text-[11px]" style={{ color: "#856404" }}>이번 키워드</div>
          <div className="font-jua text-2xl">
            {gameState.currentRound.keyword.emoji} {gameState.currentRound.keyword.word}
          </div>
        </div>
      )}

      <div className="mx-2 mt-2 flex-1">
        <DrawingCanvas
          ref={canvasRef}
          dangerOverlay={teacherState === "danger" && !caught}
          onStroke={onStroke}
        />
      </div>

      {teacherState === "tell" && !caught && (
        <div className="text-center py-1 font-jua text-sm animate-pulse" style={{ color: "var(--warning)" }}>
          ⚠️ 조심!
        </div>
      )}
      {showRelief && !caught && (
        <div className="text-center py-1 font-gaegu text-sm" style={{ color: "var(--safe)" }}>
          휴...
        </div>
      )}

      <div className="p-2">
        <button
          onClick={handleSubmit}
          disabled={caught || teacherState === "danger" || submitting}
          className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50 active:scale-95 transition-transform"
          style={{ background: "var(--danger)" }}
        >
          제출하기 ✋
        </button>
      </div>

      <PlayerBar players={gameState.players} currentPlayerId="local" />
    </div>
  );
}
