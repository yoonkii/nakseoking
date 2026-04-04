"use client";

import type { Player } from "@/lib/game/types";
import type { TeacherState } from "@/lib/game/timeline";
import type { ReactNode } from "react";

interface DesktopLayoutProps {
  children: ReactNode;
  players: Player[];
  currentPlayerId: string;
  teacherState: TeacherState;
  roomCode: string;
  roundNumber: number;
  totalRounds: number;
  timer: number;
  showRelief: boolean;
}

/**
 * Desktop wrapper (1024px+).
 * Adds classroom background, sidebar for players, wider layout.
 * On mobile, renders children directly without wrapper.
 */
export default function DesktopLayout({
  children,
  players,
  currentPlayerId,
  teacherState,
  roomCode,
  roundNumber,
  totalRounds,
  timer,
  showRelief,
}: DesktopLayoutProps) {
  const borderColor =
    teacherState === "danger" ? "var(--danger)"
    : teacherState === "tell" ? "var(--warning)"
    : showRelief ? "var(--safe)"
    : "var(--line)";

  return (
    <div className="hidden lg:flex min-h-screen items-center justify-center p-8 gap-6"
         style={{ background: "var(--bg)" }}>
      {/* Main game area */}
      <div
        className="flex flex-col w-[600px] rounded-[6px] overflow-hidden"
        style={{
          border: `4px solid ${borderColor}`,
          background: "var(--bg)",
          transition: "border-color 200ms ease-out",
        }}
      >
        {children}
      </div>

      {/* Sidebar */}
      <div className="w-[200px] flex flex-col gap-3">
        {/* Room info */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center"
          style={{ background: "var(--surface)" }}
        >
          <div className="text-[10px]" style={{ color: "var(--muted)" }}>방 코드</div>
          <div className="font-jua text-xl tracking-[4px]">{roomCode}</div>
        </div>

        {/* Round info */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center"
          style={{ background: "var(--surface)" }}
        >
          <div className="font-jua text-sm">ROUND {roundNumber}/{totalRounds}</div>
          <div
            className="font-jua text-2xl mt-1"
            style={{ color: timer <= 10 ? "var(--danger)" : "var(--text)" }}
          >
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </div>
        </div>

        {/* Players */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] p-3"
          style={{ background: "var(--surface)" }}
        >
          <div className="text-[10px] font-bold mb-2" style={{ color: "var(--muted)" }}>
            플레이어
          </div>
          {players.map((player) => {
            const isMe = player.id === currentPlayerId;
            const isOut = player.status === "out";

            return (
              <div
                key={player.id}
                className="flex items-center gap-2 py-1.5 border-b last:border-0"
                style={{ borderColor: "var(--line)" }}
              >
                <div
                  className="w-7 h-7 rounded-full border-2 border-[var(--text)] flex items-center justify-center text-xs"
                  style={{
                    background: isOut ? "#f5c6cb"
                      : player.activity === "drawing" ? "#fff3cd"
                      : "#d4edda",
                  }}
                >
                  {isOut ? "💀" : isMe ? "나" : player.avatar}
                </div>
                <div className={`flex-1 text-xs ${isOut ? "line-through opacity-50" : ""}`}>
                  {isMe ? "나" : player.nickname}
                </div>
                <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                  {isOut ? "❌" : player.activity === "drawing" ? "✏️" : "✋"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher state */}
        <div
          className="border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center"
          style={{
            background: teacherState === "danger" ? "#f5c6cb"
              : teacherState === "tell" ? "#fff3cd"
              : "#d4edda",
          }}
        >
          <div className="font-jua text-sm">
            {teacherState === "safe" ? "✏️ 안전" : teacherState === "tell" ? "⚠️ 조심" : "🛑 위험!"}
          </div>
        </div>
      </div>
    </div>
  );
}
