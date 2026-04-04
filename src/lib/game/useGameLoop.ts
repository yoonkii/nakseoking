"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateTimeline, getStateAtTime, type TeacherState, type TimelineEvent } from "./timeline";
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
  const [prevTeacherState, setPrevTeacherState] = useState<TeacherState>("safe");
  const [isDrawing, setIsDrawing] = useState(false);
  const [caught, setCaught] = useState(false);
  const [showRelief, setShowRelief] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const lastStrokeTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

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
    setPrevTeacherState("safe");
    setCaught(false);
    setShowRelief(false);
    setRoundStartTime(now);
    lastStrokeTimeRef.current = 0;
  }, [gameState.roundNumber, gameState.results, totalRounds]);

  // Game loop: update teacher state based on timeline
  useEffect(() => {
    if (gameState.status !== "playing" || !gameState.currentRound) return;

    const timeline = gameState.currentRound.timeline;
    let running = true;

    const tick = () => {
      if (!running) return;
      const elapsed = Date.now() - roundStartTime;
      const newState = getStateAtTime(timeline, elapsed);

      setTeacherState((prev) => {
        if (prev !== newState) {
          setPrevTeacherState(prev);

          // Check if player was caught (transition to danger while drawing)
          if (newState === "danger" && lastStrokeTimeRef.current > 0) {
            const dangerEvent = timeline.find(
              (e) => e.state === "danger" && e.at <= elapsed && e.at > elapsed - 500
            );
            if (dangerEvent) {
              const timeSinceStroke = dangerEvent.at - (lastStrokeTimeRef.current - roundStartTime);
              if (timeSinceStroke < 300) {
                setCaught(true);
              }
            }
          }

          // Relief feedback: danger → safe
          if (prev === "danger" && newState === "safe") {
            setShowRelief(true);
            setTimeout(() => setShowRelief(false), 500);
          }
        }
        return newState;
      });

      // Check if round is over (60 seconds)
      if (elapsed >= 60000) {
        // Round over without submission = auto-submit
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState.status, gameState.currentRound, roundStartTime]);

  // Record stroke activity
  const onStroke = useCallback(() => {
    lastStrokeTimeRef.current = Date.now();
    setIsDrawing(true);

    // Update player activity
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === "local" ? { ...p, activity: "drawing" as PlayerActivity } : p
      ),
    }));
  }, []);

  // Record stop drawing
  const onStopDrawing = useCallback(() => {
    setIsDrawing(false);
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === "local" ? { ...p, activity: "stopped" as PlayerActivity } : p
      ),
    }));
  }, []);

  // Submit drawing (mock Gemini evaluation)
  const submitDrawing = useCallback(async () => {
    if (!gameState.currentRound) return;

    const submitTime = Date.now() - roundStartTime;

    // Mock Gemini score (will be replaced by actual API call)
    const mockScore = 5 + Math.random() * 5;
    const passed = mockScore >= 5;

    const result: RoundResult = {
      roundNumber: gameState.currentRound.number,
      keyword: gameState.currentRound.keyword.word,
      rankings: [
        {
          playerId: "local",
          nickname,
          score: mockScore,
          time: submitTime,
          caught: false,
        },
        // Mock bot results
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

  return {
    gameState,
    teacherState,
    prevTeacherState,
    isDrawing,
    caught,
    showRelief,
    startRound,
    onStroke,
    onStopDrawing,
    submitDrawing,
    roundElapsed: roundStartTime ? Date.now() - roundStartTime : 0,
  };
}

function createInitialState(nickname: string, totalRounds: number): GameState {
  // Create local player + 3 bot players for testing
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
