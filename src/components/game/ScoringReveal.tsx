"use client";

import { useState, useEffect } from "react";
import type { RoundResult } from "@/lib/game/types";
import { playVictorySound, playScoreRevealSound, playOutBuzzer } from "@/lib/game/sounds";

interface ScoringRevealProps {
  result: RoundResult;
  onComplete: () => void;
}

/**
 * One-by-one reveal of each player's drawing + score.
 * Shows each player for ~3 seconds with a dramatic score reveal.
 */
export default function ScoringReveal({ result, onComplete }: ScoringRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro
  const [showScore, setShowScore] = useState(false);
  const [done, setDone] = useState(false);

  const rankings = result.rankings;

  useEffect(() => {
    // Start with intro
    const introTimer = setTimeout(() => setCurrentIndex(0), 1500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= rankings.length) return;

    // Show the player for 1.5s, then reveal score with sound
    setShowScore(false);
    const scoreTimer = setTimeout(() => {
      setShowScore(true);
      const player = rankings[currentIndex];
      if (player.caught) {
        playOutBuzzer();
      } else {
        playScoreRevealSound(player.score);
      }
    }, 1500);

    // Move to next player after 3s
    const nextTimer = setTimeout(() => {
      if (currentIndex < rankings.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setDone(true);
        playVictorySound();
        // Wait for victory moment, then complete
        setTimeout(onComplete, 2000);
      }
    }, 3000);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, rankings.length, onComplete]);

  const current = currentIndex >= 0 ? rankings[currentIndex] : null;

  // Intro screen
  if (currentIndex < 0) {
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

  // Done - show winner
  if (done) {
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

  // Individual reveal
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center"
         style={{ background: "rgba(250, 246, 232, 0.95)" }}>
      <div className="text-center max-w-[400px] w-full px-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {rankings.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i < currentIndex ? "var(--safe)"
                  : i === currentIndex ? "var(--text)"
                  : "var(--line)",
              }}
            />
          ))}
        </div>

        {/* Player name */}
        <div className="font-jua text-xl mb-4">
          {current.nickname}의 그림
        </div>

        {/* Drawing placeholder (in multiplayer, show actual image) */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] bg-white mx-auto mb-4 flex items-center justify-center"
          style={{ width: 200, height: 150 }}
        >
          {current.caught ? (
            <div className="text-center">
              <div className="text-4xl">🫣</div>
              <div className="text-xs mt-1" style={{ color: "var(--danger)" }}>걸려서 못 그림!</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl">🎨</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {result.keyword}
              </div>
            </div>
          )}
        </div>

        {/* Score reveal */}
        {showScore && (
          <div style={{ animation: "game-bounce 0.3s ease-out" }}>
            {current.caught ? (
              <div>
                <div className="font-jua text-2xl" style={{ color: "var(--danger)" }}>
                  ❌ 아웃!
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  선생님한테 걸렸습니다
                </div>
              </div>
            ) : (
              <div>
                <div className="font-jua text-3xl" style={{
                  color: current.score >= 7 ? "var(--safe)"
                    : current.score >= 5 ? "var(--warning)"
                    : "var(--danger)",
                }}>
                  {current.score.toFixed(1)}점
                </div>
                <div className="text-sm mt-1 font-gaegu" style={{ color: "var(--muted)" }}>
                  {current.score >= 8 ? "선생님: 오, 잘 그렸네!"
                    : current.score >= 6 ? "선생님: 음... 그럭저럭?"
                    : current.score >= 5 ? "선생님: 좀 더 노력해봐"
                    : "선생님: 이게 뭐야! 엎드려 뻗쳐!"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
