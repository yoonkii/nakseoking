"use client";

import type { TeacherState } from "@/lib/game/timeline";
import TeacherSvg from "./TeacherSvg";

interface ChalkboardProps {
  teacherState: TeacherState;
  chalkText?: string;
}

export default function Chalkboard({
  teacherState,
  chalkText = "오늘의 수업: 한국 역사\n고려시대의 특징은...",
}: ChalkboardProps) {
  return (
    <div
      className="relative mx-2 mt-1 rounded-[4px] p-3"
      style={{
        background: "var(--chalkboard)",
        border: "4px solid var(--frame)",
        minHeight: 90,
      }}
    >
      {/* Chalk text */}
      <div className="pr-[70px]">
        <p className="font-gaegu text-sm leading-relaxed" style={{ color: "var(--chalk-text)" }}>
          {chalkText.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < chalkText.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      {/* Teacher character */}
      <div className="absolute right-1 bottom-0">
        <TeacherSvg state={teacherState} size={50} />
      </div>

      {/* State label */}
      <div
        className="absolute right-1 top-1 text-[9px] px-1 rounded-[2px]"
        style={{
          color: teacherState === "danger" ? "white" : "var(--chalk-text)",
          background: teacherState === "danger" ? "var(--danger)" : "transparent",
          opacity: 0.8,
        }}
      >
        {teacherState === "safe" ? "판서중" : teacherState === "tell" ? "흠..." : "돌아봄!"}
      </div>
    </div>
  );
}
