"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * /join/[code] — Direct join via shared link.
 * Redirects to lobby with the room code pre-filled.
 */
export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [nickname, setNickname] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-[500px] mx-auto w-full">
      <div
        className="bg-[var(--chalkboard)] border-[4px] border-[var(--frame)] rounded-[4px] p-6 text-center mb-6 w-full"
      >
        <p className="font-gaegu text-sm" style={{ color: "var(--chalk-text)", opacity: 0.7 }}>
          초대받았습니다!
        </p>
        <p className="font-jua text-2xl mt-1" style={{ color: "var(--chalk-text)" }}>
          방 코드: {code}
        </p>
      </div>

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 8))}
        placeholder="닉네임 (2~8자)"
        className="w-full border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-lg bg-white mb-4"
      />

      <button
        onClick={() => {
          if (nickname.trim().length < 2) return;
          // TODO: Supabase room join, then redirect to game
          router.push(`/game/${code}?nickname=${encodeURIComponent(nickname.trim())}`);
        }}
        disabled={nickname.trim().length < 2}
        className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--safe)" }}
      >
        참가하기 🎮
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-4 text-sm"
        style={{ color: "var(--muted)" }}
      >
        ← 메인으로 돌아가기
      </button>
    </div>
  );
}
