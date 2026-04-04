"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateTimeline, getStateAtTime, type TeacherState } from "./timeline";
import { pickKeywords } from "./keywords";
import type { Player, GameState, RoundResult, PlayerActivity } from "./types";
import { PLAYER_AVATARS } from "./types";

interface UseGameLoopOptions {
  nickname: string;
  totalRounds?: number;
}

/**
 * Core game loop hook.
 * Manages timeline, teacher state, freeze detection, and round progression.
 * Currently runs locally (single-player + bots). Will be replaced by Supabase Realtime.
 */
export function useGameLoop({ nickname, totalRounds = 5 }: UseGameLoopOptions) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(nickname, totalRounds));
  const [teacherState, setTeacherState] = useState<TeacherState>("safe");
  const [caught, setCaught] = useState(false);
  const [showRelief, setShowRelief] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [roundTimedOut, setRoundTimedOut] = useState(false);

  const lastStrokeTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const lastProcessedEventRef = useRef<number>(-1);
  const submitDrawingRef = useRef<() => Promise<RoundResult | undefined>>(undefined!);

  // Start a new round
  const startRound = useCallback(() => {
    const nextRound = gameState.roundNumber + 1;
    const usedKeywords = gameState.results.map((r) => r.keyword);
    const [keyword] = pickKeywords(1, usedKeywords);
    const timeline = generateTimeline({ roundNumber: nextRound, totalRounds });
    const now = Date.now();

    setGameState((prev) => ({
      ...prev,
      status: "playing",
      roundNumber: nextRound,
      currentRound: {
        number: nextRound,
        keyword,
        timeline,
        startedAt: now,
      },
      players: prev.players.map((p) => ({
        ...p,
        status: "alive",
        activity: "stopped" as PlayerActivity,
      })),
    }));

    setTeacherState("safe");
    setCaught(false);
    setShowRelief(false);
    setRoundTimedOut(false);
    setRoundStartTime(now);
    lastStrokeTimeRef.current = 0;
    lastProcessedEventRef.current = -1;
  }, [gameState.roundNumber, gameState.results, totalRounds]);

  // Game loop: update teacher state based on timeline
  useEffect(() => {
    if (gameState.status !== "playing" || !gameState.currentRound) return;

    const timeline = gameState.currentRound.timeline;
    let running = true;

    const tick = () => {
      if (!running) return;
      const elapsed = Date.now() - roundStartTime;

      // Check if round is over (60 seconds)
      if (elapsed >= 60000) {
        setRoundTimedOut(true);
        return;
      }

      const newState = getStateAtTime(timeline, elapsed);

      setTeacherState((prev) => {
        if (prev !== newState) {
          return newState;
        }
        return prev;
      });

      // Check for new danger events (catch detection)
      for (let i = lastProcessedEventRef.current + 1; i < timeline.length; i++) {
        const event = timeline[i];
        if (event.at > elapsed) break;

        if (event.state === "danger" && i > lastProcessedEventRef.current) {
          lastProcessedEventRef.current = i;

          // Check if player was drawing within 300ms of danger start
          if (lastStrokeTimeRef.current > 0) {
            const strokeElapsed = lastStrokeTimeRef.current - roundStartTime;
            const timeSinceStroke = event.at - strokeElapsed;
            if (timeSinceStroke >= 0 && timeSinceStroke < 300) {
              setCaught(true);
            }
          }
        } else {
          lastProcessedEventRef.current = i;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState.status, gameState.currentRound, roundStartTime]);

  // Relief feedback: danger → safe transition
  useEffect(() => {
    if (teacherState === "safe") {
      // Check if we just came from danger (by checking timeline)
      if (gameState.currentRound && roundStartTime) {
        const elapsed = Date.now() - roundStartTime;
        const timeline = gameState.currentRound.timeline;
        // Find the most recent event before now
        for (let i = timeline.length - 1; i >= 0; i--) {
          if (timeline[i].at <= elapsed) {
            // If this safe state was preceded by a danger state
            if (i > 0 && timeline[i].state === "safe" && timeline[i - 1].state === "danger") {
              setShowRelief(true);
              const timer = setTimeout(() => setShowRelief(false), 500);
              return () => clearTimeout(timer);
            }
            break;
          }
        }
      }
    }
  }, [teacherState, gameState.currentRound, roundStartTime]);

  // Auto-submit when round times out
  useEffect(() => {
    if (roundTimedOut && submitDrawingRef.current) {
      submitDrawingRef.current();
      setRoundTimedOut(false);
    }
  }, [roundTimedOut]);

  // Record stroke activity
  const onStroke = useCallback(() => {
    lastStrokeTimeRef.current = Date.now();

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === "local" ? { ...p, activity: "drawing" as PlayerActivity } : p
      ),
    }));
  }, []);

  // Submit drawing for Gemini evaluation
  const submitDrawing = useCallback(async (imageBase64?: string): Promise<RoundResult | undefined> => {
    if (!gameState.currentRound) return;

    const submitTime = Date.now() - roundStartTime;

    // Call server-side evaluation API
    let playerScore = 5 + Math.random() * 5; // fallback
    try {
      if (imageBase64) {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: gameState.currentRound.keyword.word,
            imageBase64,
          }),
        });
        if (res.ok) {
          const evalResult = await res.json();
          playerScore = evalResult.score;
        }
      }
    } catch {
      // Use fallback score on any error
    }

    const result: RoundResult = {
      roundNumber: gameState.currentRound.number,
      keyword: gameState.currentRound.keyword.word,
      rankings: [
        {
          playerId: "local",
          nickname,
          score: playerScore,
          time: submitTime,
          caught: false,
        },
        ...gameState.players
          .filter((p) => p.id !== "local")
          .map((p) => ({
            playerId: p.id,
            nickname: p.nickname,
            score: 3 + Math.random() * 7,
            time: submitTime + Math.random() * 10000,
            caught: Math.random() < 0.3,
          })),
      ].sort((a, b) => {
        if (a.caught && !b.caught) return 1;
        if (!a.caught && b.caught) return -1;
        return b.score - a.score;
      }),
    };

    setGameState((prev) => ({
      ...prev,
      status: prev.roundNumber >= totalRounds ? "finished" : "playing",
      currentRound: null,
      results: [...prev.results, result],
    }));

    return result;
  }, [gameState.currentRound, gameState.players, roundStartTime, nickname, totalRounds]);

  // Keep ref in sync for auto-submit
  submitDrawingRef.current = submitDrawing;

  // Reset entire game to lobby state
  const resetGame = useCallback(() => {
    setGameState(createInitialState(nickname, totalRounds));
    setTeacherState("safe");
    setCaught(false);
    setShowRelief(false);
    setRoundTimedOut(false);
    setRoundStartTime(0);
    lastStrokeTimeRef.current = 0;
    lastProcessedEventRef.current = -1;
  }, [nickname, totalRounds]);

  // Prepare next round (generates keyword + timeline but doesn't start yet)
  const prepareRound = useCallback(() => {
    const nextRound = gameState.roundNumber + 1;
    const usedKeywords = gameState.results.map((r) => r.keyword);
    const [keyword] = pickKeywords(1, usedKeywords);
    const timeline = generateTimeline({ roundNumber: nextRound, totalRounds });

    return { keyword, timeline, roundNumber: nextRound };
  }, [gameState.roundNumber, gameState.results, totalRounds]);

  return {
    gameState,
    teacherState,
    caught,
    showRelief,
    startRound,
    onStroke,
    submitDrawing,
    resetGame,
    prepareRound,
  };
}

function createInitialState(nickname: string, totalRounds: number): GameState {
  const botNames = ["민수", "지은", "정호"];
  const players: Player[] = [
    {
      id: "local",
      nickname,
      avatar: "나",
      status: "alive",
      isHost: true,
      activity: "stopped",
      score: 0,
    },
    ...botNames.map((name, i) => ({
      id: `bot-${i}`,
      nickname: name,
      avatar: PLAYER_AVATARS[i],
      status: "alive" as const,
      isHost: false,
      activity: (Math.random() > 0.5 ? "drawing" : "stopped") as PlayerActivity,
      score: 0,
    })),
  ];

  return {
    roomCode: "TEST",
    status: "lobby",
    players,
    currentRound: null,
    roundNumber: 0,
    totalRounds,
    results: [],
  };
}
