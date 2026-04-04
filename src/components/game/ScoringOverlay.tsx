"use client";

import { useState, useEffect } from "react";

interface ScoringOverlayProps {
  visible: boolean;
}

/**
 * "선생님이 채점 중..." overlay with animated teacher sprite.
 */
export default function ScoringOverlay({ visible }: ScoringOverlayProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center"
      style={{ background: "rgba(250, 246, 232, 0.9)" }}
    >
      <div className="text-center">
        {/* Teacher grading animation */}
        <div className="text-6xl mb-4" style={{ animation: "game-bounce 1.5s ease-in-out infinite" }}>
          📝
        </div>
        <div className="font-jua text-xl" style={{ color: "var(--text)" }}>
          선생님이 채점 중{dots}
        </div>
        <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Gemini가 그림을 평가하고 있습니다
        </div>
      </div>
    </div>
  );
}
