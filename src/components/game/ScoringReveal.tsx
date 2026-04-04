"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { RoundResult } from "@/lib/game/types";
import { playVictorySound, playScoreRevealSound, playOutBuzzer } from "@/lib/game/sounds";

interface ScoringRevealProps {
  result: RoundResult;
  onComplete: () => void;
}

/**
 * One-by-one reveal of each player's drawing + score.
 * Each player gets ~3.5 seconds: 1.5s buildup → score reveal → 2s to read.
 */
export default function ScoringReveal({ result, onComplete }: ScoringRevealProps) {
  const [phase, setPhase] = useState<"intro" | "revealing" | "done">("intro");
  const [revealIndex, setRevealIndex] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const rankings = result.rankings;

  // Intro → start revealing after 1.5s
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("revealing"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Revealing: show score after 1.5s, advance after 3.5s
  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealIndex >= rankings.length) {
      setPhase("done");
      playVictorySound();
      const t = setTimeout(() => onCompleteRef.current(), 2500);
      return () => clearTimeout(t);
    }

    setScoreVisible(false);

    const scoreTimer = setTimeout(() => {
      setScoreVisible(true);
      const player = rankings[revealIndex];
      if (player.caught) {
        playOutBuzzer();
      } else {
        playScoreRevealSound(player.score);
      }
    }, 1500);

    const advanceTimer = setTimeout(() => {
      setRevealIndex((i) => i + 1);
    }, 3500);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(advanceTimer);
    };
  }, [phase, revealIndex, rankings]);

  // === INTRO ===
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center"
           style={{ background: "rgba(250, 246, 232, 0.95)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <div className="font-jua text-2xl">채점 시간!</div>
          <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            선생님이 그림을 하나씩 확인합니다...
          </div>
        </div>
      </div>
    );
  }

  // === DONE ===
  if (phase === "done") {
    const winner = rankings[0];
    const allCaught = rankings.every((r) => r.caught);
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center"
           style={{ background: "rgba(250, 246, 232, 0.95)" }}>
        <div className="text-center">
          {allCaught ? (
            <>
              <div className="text-6xl mb-4">💀</div>
              <div className="font-jua text-3xl">전원 아웃!</div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4" style={{ animation: "game-bounce 0.5s ease-out" }}>👑</div>
              <div className="font-jua text-3xl">{winner.nickname}!</div>
              <div className="font-jua text-xl mt-2" style={{ color: "var(--safe)" }}>
                {winner.score.toFixed(1)}점
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // === REVEALING ===
  const current = rankings[revealIndex];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center"
         style={{ background: "rgba(250, 246, 232, 0.95)" }}>
      <div className="text-center max-w-[400px] w-full px-6">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {rankings.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-[var(--text)]"
              style={{
                background: i < revealIndex ? "var(--safe)"
                  : i === revealIndex ? "var(--warning)"
                  : "var(--surface)",
              }}
            />
          ))}
        </div>

        {/* Player */}
        <div className="font-jua text-xl mb-4">
          {current.nickname}의 작품
        </div>

        {/* Drawing area */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] bg-white mx-auto mb-4 flex items-center justify-center"
          style={{ width: 220, height: 160 }}
        >
          {current.caught ? (
            <div className="text-center">
              <div className="text-4xl">🫣</div>
              <div className="text-xs mt-2" style={{ color: "var(--danger)" }}>
                걸려서 못 그렸어요!
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-1">🎨</div>
              <div className="font-gaegu text-lg" style={{ color: "var(--muted)" }}>
                &ldquo;{result.keyword}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* Score */}
        {scoreVisible ? (
          <div style={{ animation: "game-bounce 0.3s ease-out" }}>
            {current.caught ? (
              <div>
                <div className="font-jua text-2xl" style={{ color: "var(--danger)" }}>❌ 아웃!</div>
                <div className="text-sm mt-1 font-gaegu" style={{ color: "var(--muted)" }}>
                  선생님한테 들켰습니다
                </div>
              </div>
            ) : (
              <div>
                <div className="font-jua text-4xl" style={{
                  color: current.score >= 7 ? "var(--safe)"
                    : current.score >= 5 ? "var(--warning)"
                    : "var(--danger)",
                }}>
                  {current.score.toFixed(1)}점
                </div>
                <div className="text-sm mt-2 font-gaegu" style={{ color: "var(--muted)" }}>
                  {current.score >= 8 ? "선생님: 오, 잘 그렸네! 👏"
                    : current.score >= 6 ? "선생님: 음... 그럭저럭? 🤔"
                    : current.score >= 5 ? "선생님: 좀 더 노력해봐 😐"
                    : "선생님: 이게 뭐야! 엎드려 뻗쳐! 😡"}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="font-jua text-lg animate-pulse" style={{ color: "var(--muted)" }}>
            채점 중...
          </div>
        )}
      </div>
    </div>
  );
}
