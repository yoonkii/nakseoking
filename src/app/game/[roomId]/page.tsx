"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Chalkboard from "@/components/game/Chalkboard";
import PlayerBar from "@/components/game/PlayerBar";
import CaughtOverlay from "@/components/game/CaughtOverlay";
import ResultScreen from "@/components/game/ResultScreen";
import CountdownOverlay from "@/components/game/CountdownOverlay";
import ScoringOverlay from "@/components/game/ScoringOverlay";
import ShareCode from "@/components/game/ShareCode";
import { useGameLoop } from "@/lib/game/useGameLoop";
import type { RoundResult } from "@/lib/game/types";
import type { DrawingCanvasHandle } from "@/components/game/DrawingCanvas";
import {
  playWarningSound,
  playDangerSound,
  playReliefSound,
  playCaughtSound,
  playSubmitSound,
} from "@/lib/game/sounds";

const DrawingCanvas = dynamic(() => import("@/components/game/DrawingCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="border-[3px] border-[var(--text)] rounded-[4px] bg-white flex items-center justify-center"
      style={{ height: 200 }}
    >
      <span style={{ color: "var(--muted)" }}>캔버스 준비 중...</span>
    </div>
  ),
});

export default function GamePage() {
  const params = useParams();
  const roomId = (params.roomId as string)?.toUpperCase() || "TEST";

  const [nickname] = useState(() => {
    if (typeof window === "undefined") return "플레이어";
    const p = new URLSearchParams(window.location.search);
    return p.get("nickname") || "플레이어";
  });

  const {
    gameState,
    teacherState,
    caught,
    showRelief,
    startRound,
    onStroke,
    submitDrawing,
    resetGame,
    prepareRound,
  } = useGameLoop({ nickname, totalRounds: 5 });

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [latestResult, setLatestResult] = useState<RoundResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [pendingRound, setPendingRound] = useState<ReturnType<typeof prepareRound> | null>(null);

  // Timer
  useEffect(() => {
    if (gameState.status !== "playing" || !gameState.currentRound) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - gameState.currentRound!.startedAt) / 1000;
      setTimer(Math.max(0, Math.ceil(60 - elapsed)));
    }, 100);
    return () => clearInterval(interval);
  }, [gameState.status, gameState.currentRound]);

  // Sound effects
  const prevStateRef = useRef(teacherState);
  useEffect(() => {
    if (prevStateRef.current !== teacherState) {
      if (teacherState === "tell") playWarningSound();
      if (teacherState === "danger") playDangerSound();
      prevStateRef.current = teacherState;
    }
  }, [teacherState]);
  useEffect(() => { if (showRelief) playReliefSound(); }, [showRelief]);
  useEffect(() => { if (caught) playCaughtSound(); }, [caught]);

  // Show result
  useEffect(() => {
    if (gameState.results.length > 0 && !gameState.currentRound && !submitting) {
      setLatestResult(gameState.results[gameState.results.length - 1]);
      setShowResult(true);
    }
  }, [gameState.results, gameState.currentRound, submitting]);

  // Begin round with countdown
  const beginRoundWithCountdown = useCallback(() => {
    const prepared = prepareRound();
    setPendingRound(prepared);
    setCountdown(true);
  }, [prepareRound]);

  const handleCountdownComplete = useCallback(() => {
    setCountdown(false);
    setPendingRound(null);
    canvasRef.current?.clear();
    setTimer(60);
    startRound();
  }, [startRound]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    playSubmitSound();

    let imageBase64: string | undefined;
    try {
      const img = await canvasRef.current?.exportImage();
      if (img) imageBase64 = img;
    } catch { /* fallback */ }

    const result = await submitDrawing(imageBase64);
    setSubmitting(false);
    if (result) {
      setLatestResult(result);
      setShowResult(true);
    }
  }, [submitDrawing, submitting]);

  // Clear canvas on new round
  useEffect(() => {
    if (gameState.currentRound) {
      canvasRef.current?.clear();
      setTimer(60);
    }
  }, [gameState.currentRound?.number]);

  const borderColor =
    teacherState === "danger" ? "var(--danger)"
    : teacherState === "tell" ? "var(--warning)"
    : showRelief ? "var(--safe)"
    : "transparent";

  // === LOBBY ===
  if (gameState.status === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 select-none">
        <h1 className="font-jua text-3xl mb-4">낙서왕 ✏️</h1>

        <ShareCode code={roomId} />

        <p className="text-sm mt-4 mb-6" style={{ color: "var(--muted)" }}>
          {gameState.players.length}명 참가 중
        </p>

        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {gameState.players.map((p) => (
            <div key={p.id} className="text-center">
              <div
                className="w-12 h-12 rounded-full border-2 border-[var(--text)] flex items-center justify-center text-xl mx-auto"
                style={{ background: "#d4edda" }}
              >
                {p.id === "local" ? "나" : p.avatar}
              </div>
              <div className="text-xs mt-1">{p.id === "local" ? nickname : p.nickname}</div>
            </div>
          ))}
        </div>

        <button
          onClick={beginRoundWithCountdown}
          className="text-white border-[3px] border-[var(--text)] rounded-[4px] px-12 py-3 font-jua text-xl"
          style={{ background: "var(--safe)" }}
        >
          게임 시작! 🎮
        </button>
      </div>
    );
  }

  // === RESULT ===
  if (showResult && latestResult) {
    return (
      <ResultScreen
        result={latestResult}
        isFinalRound={gameState.roundNumber >= gameState.totalRounds}
        onNextRound={() => {
          setShowResult(false);
          beginRoundWithCountdown();
        }}
        onPlayAgain={() => {
          setShowResult(false);
          resetGame();
        }}
      />
    );
  }

  // === GAMEPLAY ===
  return (
    <div
      className="flex flex-col min-h-screen max-w-[500px] mx-auto w-full select-none game-active"
      style={{
        border: `4px solid ${borderColor}`,
        transition: "border-color 200ms ease-out",
      }}
    >
      {/* Overlays */}
      <CaughtOverlay visible={caught} />
      <ScoringOverlay visible={submitting} />
      <CountdownOverlay
        active={countdown}
        keyword={pendingRound?.keyword ?? null}
        roundNumber={pendingRound?.roundNumber ?? gameState.roundNumber + 1}
        onComplete={handleCountdownComplete}
      />

      {/* Top bar */}
      <div
        className="flex justify-between items-center px-3 py-2 border-b-2 border-[var(--text)] text-sm font-bold"
        style={{ background: "#e8e0c8" }}
      >
        <span className="font-jua">ROUND {gameState.roundNumber}/{gameState.totalRounds}</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>
          {gameState.players.filter((p) => p.status === "alive").length}/{gameState.players.length} 생존
        </span>
        <span
          className="font-jua text-lg"
          style={{ color: timer <= 10 ? "var(--danger)" : "var(--text)" }}
        >
          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Chalkboard */}
      <Chalkboard teacherState={teacherState} />

      {/* Keyword */}
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

      {/* Canvas */}
      <div className="mx-2 mt-2 flex-1">
        <DrawingCanvas
          ref={canvasRef}
          locked={teacherState === "danger" || caught}
          onStroke={onStroke}
        />
      </div>

      {/* State feedback */}
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

      {/* Submit */}
      <div className="p-2">
        <button
          onClick={handleSubmit}
          disabled={caught || teacherState === "danger" || submitting}
          className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50"
          style={{ background: "var(--danger)" }}
        >
          제출하기 ✋
        </button>
      </div>

      {/* Players */}
      <PlayerBar players={gameState.players} currentPlayerId="local" />
    </div>
  );
}
