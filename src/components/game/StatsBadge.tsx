"use client";

import { useEffect, useState } from "react";
import { loadStats, type GameStats } from "@/lib/game/stats";

/**
 * Small stats badge shown on the lobby screen.
 * Shows games played, best score, etc.
 */
export default function StatsBadge() {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  if (!stats || stats.gamesPlayed === 0) return null;

  return (
    <div
      className="border-[2px] border-[var(--text)] rounded-[4px] p-3 w-full max-w-[300px] mb-4"
      style={{ background: "var(--surface)" }}
    >
      <div className="text-[10px] font-bold mb-2" style={{ color: "var(--muted)" }}>
        내 전적
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-jua text-lg">{stats.gamesPlayed}</div>
          <div className="text-[10px]" style={{ color: "var(--muted)" }}>게임</div>
        </div>
        <div>
          <div className="font-jua text-lg" style={{ color: "var(--safe)" }}>{stats.wins}</div>
          <div className="text-[10px]" style={{ color: "var(--muted)" }}>승리</div>
        </div>
        <div>
          <div className="font-jua text-lg" style={{ color: "var(--warning)" }}>
            {stats.bestScore > 0 ? stats.bestScore.toFixed(1) : "-"}
          </div>
          <div className="text-[10px]" style={{ color: "var(--muted)" }}>최고점</div>
        </div>
      </div>
      {stats.timesCaught > 0 && (
        <div className="text-[10px] text-center mt-2" style={{ color: "var(--danger)" }}>
          걸린 횟수: {stats.timesCaught}번 😅
        </div>
      )}
    </div>
  );
}
