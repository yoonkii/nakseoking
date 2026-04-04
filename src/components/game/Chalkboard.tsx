"use client";

import type { TeacherState } from "@/lib/game/timeline";

interface ChalkboardProps {
  teacherState: TeacherState;
  chalkText?: string;
}

/**
 * Chalkboard with teacher character.
 * Teacher pose changes based on state:
 * - safe: back turned, writing
 * - tell: head slightly turned
 * - danger: fully turned, facing students
 */
export default function Chalkboard({ teacherState, chalkText = "오늘의 수업: 한국 역사\n고려시대의 특징은..." }: ChalkboardProps) {
  return (
    <div
      className="relative mx-2 rounded-[4px] p-3 min-h-[80px]"
      style={{
        background: "var(--chalkboard)",
        border: "4px solid var(--frame)",
      }}
    >
      {/* Chalk text */}
      <p className="font-gaegu text-base leading-relaxed" style={{ color: "var(--chalk-text)" }}>
        {chalkText.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < chalkText.split("\n").length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* Teacher character (SVG placeholder) */}
      <div className="absolute right-2 bottom-0">
        <TeacherSprite state={teacherState} />
      </div>
    </div>
  );
}

function TeacherSprite({ state }: { state: TeacherState }) {
  // Simple CSS-based teacher sprite
  const isBackTurned = state === "safe";
  const isTurning = state === "tell";
  const isFacing = state === "danger";

  return (
    <div className="flex flex-col items-center" style={{ width: 40 }}>
      {/* Head */}
      <div
        className="rounded-full border-2 border-[var(--text)]"
        style={{
          width: 20,
          height: 20,
          background: "#f0c8a0",
          transform: isTurning ? "rotate(-15deg)" : undefined,
        }}
      >
        {/* Eyes (only visible when facing or turning) */}
        {(isFacing || isTurning) && (
          <div className="flex justify-center gap-[3px] pt-[5px]">
            <div className="w-[3px] h-[3px] bg-[var(--text)] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[var(--text)] rounded-full" />
          </div>
        )}
      </div>
      {/* Body */}
      <div
        className="rounded-t-[4px] border-2 border-[var(--text)]"
        style={{
          width: 24,
          height: 32,
          background: "#444",
          marginTop: -2,
        }}
      />
      {/* Arm (only when writing) */}
      {isBackTurned && (
        <div
          className="absolute bg-[#444] rounded-[2px]"
          style={{
            width: 16,
            height: 3,
            right: -4,
            top: 28,
            transform: "rotate(-30deg)",
          }}
        />
      )}
      {/* Pointing finger (when caught) */}
      {isFacing && (
        <div className="text-xs mt-[-2px]">👆</div>
      )}
      {/* Label */}
      <div className="text-[8px] mt-1" style={{ color: "var(--muted)" }}>
        {isBackTurned ? "판서중" : isTurning ? "조심!" : "돌아봄!"}
      </div>
    </div>
  );
}
