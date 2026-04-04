"use client";

import type { Player } from "@/lib/game/types";

interface PlayerBarProps {
  players: Player[];
  currentPlayerId: string;
}

export default function PlayerBar({ players, currentPlayerId }: PlayerBarProps) {
  return (
    <div
      className="flex justify-around p-2 border-t-2 border-[var(--text)]"
      style={{ background: "#e8e0c8" }}
    >
      {players.map((player) => {
        const isMe = player.id === currentPlayerId;
        const isOut = player.status === "out";

        return (
          <div key={player.id} className="text-center text-[10px]">
            <div
              className="w-8 h-8 rounded-full border-2 border-[var(--text)] mx-auto mb-[3px] flex items-center justify-center text-sm"
              style={{
                background: isOut
                  ? "#f5c6cb"
                  : player.activity === "drawing"
                  ? "#fff3cd"
                  : player.activity === "stopped"
                  ? "#d4edda"
                  : "#e8e0c8",
              }}
            >
              {isOut ? "💀" : isMe ? "나" : player.avatar}
            </div>
            <div className={isOut ? "line-through opacity-50" : ""}>
              {isMe ? "나" : player.nickname}
            </div>
            <div style={{ color: "var(--muted)" }}>
              {isOut ? "❌" : player.activity === "drawing" ? "✏️" : "✋"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
