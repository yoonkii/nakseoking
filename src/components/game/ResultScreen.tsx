"use client";

import type { RoundResult } from "@/lib/game/types";

interface ResultScreenProps {
  result: RoundResult;
  onNextRound?: () => void;
  onPlayAgain?: () => void;
  isFinalRound: boolean;
}

export default function ResultScreen({
  result,
  onNextRound,
  onPlayAgain,
  isFinalRound,
}: ResultScreenProps) {
  const winner = result.rankings[0];
  const allCaught = result.rankings.every((r) => r.caught);

  return (
    <div className="flex flex-col items-center p-6 max-w-[500px] mx-auto w-full min-h-screen justify-center">
      {/* Winner crown or no winner */}
      {allCaught ? (
        <>
          <div className="text-5xl mb-2">💀</div>
          <div className="font-jua text-2xl mb-4">오늘의 낙서왕 없음!</div>
          <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            전원 걸렸습니다...
          </div>
        </>
      ) : (
        <>
          <div className="text-5xl mb-2">👑</div>
          <div className="font-jua text-2xl mb-4">
            {isFinalRound ? "낙서왕" : "라운드 승자"}: {winner?.nickname}!
          </div>
        </>
      )}

      {/* AI score (for winner) */}
      {winner && !winner.caught && (
        <div className="mb-4 text-center">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Gemini 평가
          </div>
          <div className="font-jua text-3xl" style={{ color: "var(--safe)" }}>
            {winner.score.toFixed(1)} / 10
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="w-full mb-6">
        {result.rankings.map((rank, i) => (
          <div
            key={rank.playerId}
            className="flex items-center gap-3 py-2 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="font-jua text-base w-6">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </div>
            <div
              className={`flex-1 text-sm ${rank.caught ? "line-through opacity-50" : ""}`}
            >
              {rank.nickname}
            </div>
            <div className="text-xs" style={{ color: rank.caught ? "var(--danger)" : "var(--muted)" }}>
              {rank.caught ? "❌ 걸림" : `${rank.score.toFixed(1)}점 · ${(rank.time / 1000).toFixed(0)}초`}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {isFinalRound ? (
        <button
          onClick={onPlayAgain}
          className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg"
          style={{ background: "var(--warning)" }}
        >
          한 판 더! 🔄
        </button>
      ) : (
        <button
          onClick={onNextRound}
          className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg"
          style={{ background: "var(--safe)" }}
        >
          다음 라운드 ▶️
        </button>
      )}
    </div>
  );
}
