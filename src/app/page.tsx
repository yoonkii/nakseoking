"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatsBadge from "@/components/game/StatsBadge";
import { unlockAudio } from "@/lib/game/sounds";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function Home() {
  const router = useRouter();
  const [screen, setScreen] = useState<"splash" | "menu">("splash");
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  if (screen === "splash") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 cursor-pointer select-none"
        onClick={() => { unlockAudio(); setScreen("menu"); }}
      >
        <div
          className="bg-[var(--chalkboard)] border-[6px] border-[var(--frame)] rounded-[4px] p-12 text-center"
          style={{ transform: "rotate(-1deg)" }}
        >
          <h1
            className="font-jua text-5xl"
            style={{ color: "var(--chalk-text)", textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
          >
            ✏️ 낙서왕
          </h1>
          <p className="font-gaegu text-xl mt-2" style={{ color: "var(--chalk-text)", opacity: 0.8 }}>
            선생님 몰래 낙서 배틀!
          </p>
        </div>
        <p className="text-sm mt-8 animate-pulse" style={{ color: "var(--muted)" }}>
          탭하여 시작하기
        </p>
      </div>
    );
  }

  const handleSinglePlay = () => {
    const name = nickname.trim() || "플레이어";
    router.push(`/game/SOLO?nickname=${encodeURIComponent(name)}&mode=single`);
  };

  const handleCreateRoom = async () => {
    const name = nickname.trim();
    if (name.length < 2) {
      setError("닉네임을 2자 이상 입력해주세요");
      return;
    }
    setError("");

    // Try Supabase first
    try {
      const { createRoom } = await import("@/lib/supabase/rooms");
      const result = await createRoom(name);
      if (result) {
        localStorage.setItem("nakseoking-player-id", result.player.id);
        router.push(`/game/${result.room.code}?nickname=${encodeURIComponent(name)}&room=${result.room.id}&player=${result.player.id}`);
        return;
      }
    } catch {}

    // Fallback: local mode
    const code = generateCode();
    router.push(`/game/${code}?nickname=${encodeURIComponent(name)}&mode=single`);
  };

  const handleJoinRoom = async () => {
    const name = nickname.trim();
    if (name.length < 2) {
      setError("닉네임을 2자 이상 입력해주세요");
      return;
    }
    if (joinCode.length !== 4) {
      setError("4자리 방 코드를 입력해주세요");
      return;
    }
    setError("");

    try {
      const { joinRoom } = await import("@/lib/supabase/rooms");
      const result = await joinRoom(joinCode, name);
      if (result) {
        localStorage.setItem("nakseoking-player-id", result.player.id);
        router.push(`/game/${result.room.code}?nickname=${encodeURIComponent(name)}&room=${result.room.id}&player=${result.player.id}`);
        return;
      }
      setError("방을 찾을 수 없습니다. 코드를 확인해주세요.");
    } catch {
      setError("연결 오류. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-[500px] mx-auto w-full">
      <h1 className="font-jua text-3xl mb-1">낙서왕 ✏️</h1>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        선생님 몰래 낙서 배틀!
      </p>

      <StatsBadge />

      {/* Single play button - always works */}
      <button
        onClick={handleSinglePlay}
        className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg mb-6"
        style={{ background: "var(--danger)" }}
      >
        혼자 연습하기 🎯
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full mb-4">
        <div className="flex-1 h-[2px]" style={{ background: "var(--line)" }} />
        <span className="text-xs" style={{ color: "var(--muted)" }}>친구와 함께</span>
        <div className="flex-1 h-[2px]" style={{ background: "var(--line)" }} />
      </div>

      {/* Nickname */}
      <input
        type="text"
        value={nickname}
        onChange={(e) => { setNickname(e.target.value.slice(0, 8)); setError(""); }}
        placeholder="닉네임 (2~8자)"
        className="w-full border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-lg bg-white mb-3"
        onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
      />

      {error && (
        <div className="text-xs mb-3" style={{ color: "var(--danger)" }}>{error}</div>
      )}

      {/* Create room */}
      <button
        onClick={handleCreateRoom}
        disabled={nickname.trim().length < 2}
        className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        style={{ background: "var(--safe)" }}
      >
        방 만들기 🎮
      </button>

      {/* Join room */}
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => { setJoinCode(e.target.value.toUpperCase().slice(0, 4)); setError(""); }}
          placeholder="방 코드"
          maxLength={4}
          className="flex-1 border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-xl tracking-[4px] bg-white"
          onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
        />
        <button
          onClick={handleJoinRoom}
          disabled={nickname.trim().length < 2 || joinCode.length !== 4}
          className="text-white border-[3px] border-[var(--text)] rounded-[4px] px-6 font-jua text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--warning)" }}
        >
          참가
        </button>
      </div>
    </div>
  );
}
