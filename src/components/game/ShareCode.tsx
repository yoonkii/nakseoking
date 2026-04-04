"use client";

import { useState, useCallback } from "react";

interface ShareCodeProps {
  code: string;
}

/**
 * Room code display with copy + Web Share API.
 */
export default function ShareCode({ code }: ShareCodeProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${code}`
    : `/join/${code}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "낙서왕에서 같이 놀자!",
          text: `낙서왕에서 같이 놀자! 🎨 방 코드: ${code}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [code, shareUrl, handleCopy]);

  return (
    <div className="text-center">
      {/* Code display */}
      <div
        className="border-[3px] border-[var(--text)] rounded-[4px] bg-white py-3 px-6 mb-3 inline-block"
      >
        <div className="text-[10px]" style={{ color: "var(--muted)" }}>방 코드</div>
        <div className="font-jua text-3xl tracking-[6px]">{code}</div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleCopy}
          className="border-[2px] border-[var(--text)] rounded-[4px] px-4 py-2 text-sm bg-white"
        >
          {copied ? "✅ 복사됨!" : "📋 코드 복사"}
        </button>
        <button
          onClick={handleShare}
          className="border-[2px] border-[var(--text)] rounded-[4px] px-4 py-2 text-sm text-white"
          style={{ background: "var(--safe)" }}
        >
          📤 공유하기
        </button>
      </div>
    </div>
  );
}
