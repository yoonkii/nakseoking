"use client";

import { useEffect, useState } from "react";

interface CaughtOverlayProps {
  visible: boolean;
  onDismiss?: () => void;
}

/**
 * Full-screen red overlay when player is caught.
 * "야! 거기!" + push-up animation
 */
export default function CaughtOverlay({ visible, onDismiss }: CaughtOverlayProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (visible) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "var(--danger)",
        animation: shake ? "shake 0.15s ease-in-out" : undefined,
      }}
      onClick={onDismiss}
    >
      <div className="text-white text-center">
        <div className="font-jua text-4xl mb-2">야! 거기! 🫵</div>
        <div className="text-base opacity-80 mb-6">선생님이 돌아봤습니다</div>

        {/* Push-up emoji animation */}
        <div
          className="text-6xl mb-6"
          style={{ animation: "bounce 0.8s ease-in-out infinite" }}
        >
          🏋️
        </div>

        <div className="text-sm opacity-70 mb-2">엎.드.려.뻗.쳐!</div>
        <div className="text-xs opacity-50 mt-8">
          다음 라운드까지 관전 모드...
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
