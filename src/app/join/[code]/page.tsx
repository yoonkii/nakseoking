"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    const name = nickname.trim();
    if (name.length < 2) {
      setError("닉네임을 2자 이상 입력해주세요");
      return;
    }
    setJoining(true);
    setError("");

    try {
      const { joinRoom } = await import("@/lib/supabase/rooms");
      const result = await joinRoom(code, name);
      if (result) {
        localStorage.setItem("nakseoking-player-id", result.player.id);
        router.push(`/game/${code}?nickname=${encodeURIComponent(name)}&room=${result.room.id}&player=${result.player.id}`);
        return;
      }
      setError("방을 찾을 수 없거나 이미 시작된 게임입니다.");
    } catch {
      setError("연결 오류. 잠시 후 다시 시도해주세요.");
    }
    setJoining(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-[500px] mx-auto w-full">
      <div className="bg-[var(--chalkboard)] border-[4px] border-[var(--frame)] rounded-[4px] p-6 text-center mb-6 w-full">
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
        onChange={(e) => { setNickname(e.target.value.slice(0, 8)); setError(""); }}
        placeholder="닉네임 (2~8자)"
        className="w-full border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-lg bg-white mb-3"
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />

      {error && (
        <div className="text-xs mb-3" style={{ color: "var(--danger)" }}>{error}</div>
      )}

      <button
        onClick={handleJoin}
        disabled={nickname.trim().length < 2 || joining}
        className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50 active:scale-95 transition-transform"
        style={{ background: "var(--safe)" }}
      >
        {joining ? "참가 중..." : "참가하기 🎮"}
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
