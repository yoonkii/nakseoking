"use client";

import { useEffect, useState } from "react";

interface CountdownOverlayProps {
  active: boolean;
  keyword: { word: string; emoji: string } | null;
  roundNumber: number;
  onComplete: () => void;
}

/**
 * 3...2...1...시작! countdown before each round.
 * Shows the keyword so players know what to draw.
 */
export default function CountdownOverlay({
  active,
  keyword,
  roundNumber,
  onComplete,
}: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!active) {
      setCount(3);
      return;
    }

    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [active, count, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
         style={{ background: "rgba(250, 246, 232, 0.95)" }}>
      <div className="text-center">
        <div className="font-jua text-lg mb-2" style={{ color: "var(--muted)" }}>
          ROUND {roundNumber}
        </div>

        {keyword && (
          <div
            className="mb-8 py-3 px-8 rounded-[4px]"
            style={{ background: "#fff3cd", border: "2px dashed var(--warning)" }}
          >
            <div className="text-xs" style={{ color: "#856404" }}>이번 키워드</div>
            <div className="font-jua text-3xl mt-1">
              {keyword.emoji} {keyword.word}
            </div>
          </div>
        )}

        {count > 0 ? (
          <div
            className="font-jua text-8xl"
            style={{
              color: count === 1 ? "var(--danger)" : "var(--text)",
              animation: "game-bounce 0.5s ease-out",
            }}
            key={count}
          >
            {count}
          </div>
        ) : (
          <div
            className="font-jua text-5xl"
            style={{ color: "var(--safe)" }}
          >
            시작! ✏️
          </div>
        )}
      </div>
    </div>
  );
}
