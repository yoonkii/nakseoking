"use client";

import { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareCodeProps {
  code: string;
}

export default function ShareCode({ code }: ShareCodeProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${code}`
    : `/join/${code}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [code, shareUrl, handleCopy]);

  return (
    <div className="text-center w-full max-w-[320px]">
      {/* Code display */}
      <div className="border-[3px] border-[var(--text)] rounded-[4px] bg-white py-3 px-6 mb-3">
        <div className="text-[10px]" style={{ color: "var(--muted)" }}>방 코드</div>
        <div className="font-jua text-3xl tracking-[6px]">{code}</div>
      </div>

      {/* QR Code toggle */}
      {showQR && (
        <div className="border-[3px] border-[var(--text)] rounded-[4px] bg-white p-4 mb-3 flex justify-center">
          <QRCodeSVG
            value={shareUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#333333"
            level="M"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleCopy}
          className="border-[2px] border-[var(--text)] rounded-[4px] px-3 py-2 text-xs bg-white"
        >
          {copied ? "✅ 복사됨!" : "📋 복사"}
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          className="border-[2px] border-[var(--text)] rounded-[4px] px-3 py-2 text-xs bg-white"
        >
          {showQR ? "🔼 QR 닫기" : "📱 QR코드"}
        </button>
        <button
          onClick={handleShare}
          className="border-[2px] border-[var(--text)] rounded-[4px] px-3 py-2 text-xs text-white"
          style={{ background: "var(--safe)" }}
        >
          📤 공유
        </button>
      </div>
    </div>
  );
}
