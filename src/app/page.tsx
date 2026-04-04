"use client";

import { useState } from "react";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function Home() {
  const [screen, setScreen] = useState<"splash" | "lobby">("splash");
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");

  if (screen === "splash") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 cursor-pointer"
        onClick={() => setScreen("lobby")}
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-[500px] mx-auto w-full">
      <h1 className="font-jua text-3xl mb-1">낙서왕 ✏️</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        선생님 몰래 낙서 배틀!
      </p>

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 8))}
        placeholder="닉네임 (2~8자)"
        className="w-full border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-lg bg-white mb-6"
      />

      <button
        onClick={() => {
          if (nickname.trim().length < 2) return;
          const code = generateCode();
          alert(`방 생성! 코드: ${code}`);
        }}
        disabled={nickname.trim().length < 2}
        className="w-full text-white border-[3px] border-[var(--text)] rounded-[4px] p-3 font-jua text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        style={{ background: "var(--safe)" }}
      >
        방 만들기 🎮
      </button>

      <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        — 또는 방 참가 —
      </div>

      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="코드"
          maxLength={4}
          className="flex-1 border-[3px] border-[var(--text)] rounded-[4px] p-3 text-center text-xl tracking-[4px] bg-white"
        />
        <button
          onClick={() => {
            if (nickname.trim().length < 2 || joinCode.length !== 4) return;
            alert(`방 참가: ${joinCode}`);
          }}
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
