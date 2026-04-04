"use client";

import type { TeacherState } from "@/lib/game/timeline";

interface TeacherSvgProps {
  state: TeacherState;
  size?: number;
}

/**
 * SVG teacher character with 3 poses:
 * - safe: back turned, writing on board
 * - tell: head slightly turned (suspicious)
 * - danger: fully facing students, pointing
 */
export default function TeacherSvg({ state, size = 80 }: TeacherSvgProps) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 80 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: "transform 300ms ease-in-out" }}
    >
      {state === "safe" && <TeacherBack />}
      {state === "tell" && <TeacherTurning />}
      {state === "danger" && <TeacherFacing />}
    </svg>
  );
}

/** Back turned, writing on chalkboard */
function TeacherBack() {
  return (
    <g>
      {/* Hair (back of head) */}
      <ellipse cx="40" cy="22" rx="14" ry="15" fill="#4a3728" stroke="#333" strokeWidth="2.5" />
      {/* Body */}
      <rect x="22" y="36" width="36" height="44" rx="4" fill="#5a5a5a" stroke="#333" strokeWidth="2.5" />
      {/* Right arm (writing) */}
      <line x1="58" y1="46" x2="72" y2="28" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      {/* Chalk in hand */}
      <rect x="70" y="24" width="8" height="4" rx="2" fill="#e8e8d0" stroke="#333" strokeWidth="1.5"
            transform="rotate(-50 74 26)" />
      {/* Left arm */}
      <line x1="22" y1="50" x2="14" y2="62" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <rect x="28" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      <rect x="42" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      {/* Shoes */}
      <ellipse cx="33" cy="108" rx="8" ry="4" fill="#333" />
      <ellipse cx="47" cy="108" rx="8" ry="4" fill="#333" />
    </g>
  );
}

/** Head slightly turned, suspicious */
function TeacherTurning() {
  return (
    <g>
      {/* Head (3/4 view) */}
      <ellipse cx="40" cy="22" rx="14" ry="15" fill="#f0c8a0" stroke="#333" strokeWidth="2.5" />
      {/* Hair */}
      <path d="M26 18 Q30 6 44 6 Q56 6 54 18" fill="#4a3728" stroke="#333" strokeWidth="2" />
      {/* One eye visible (suspicious squint) */}
      <ellipse cx="46" cy="20" rx="2.5" ry="1.5" fill="#333" />
      {/* Eyebrow raised */}
      <line x1="43" y1="16" x2="50" y2="15" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      {/* Body (slightly turned) */}
      <rect x="24" y="36" width="34" height="44" rx="4" fill="#5a5a5a" stroke="#333" strokeWidth="2.5" />
      {/* Arms at sides */}
      <line x1="58" y1="46" x2="64" y2="62" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="50" x2="16" y2="62" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <rect x="28" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      <rect x="42" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      <ellipse cx="33" cy="108" rx="8" ry="4" fill="#333" />
      <ellipse cx="47" cy="108" rx="8" ry="4" fill="#333" />
      {/* Question mark */}
      <text x="60" y="12" fontSize="14" fill="var(--warning)" fontFamily="var(--font-jua)">?</text>
    </g>
  );
}

/** Fully facing students, angry, pointing */
function TeacherFacing() {
  return (
    <g>
      {/* Head (front view) */}
      <ellipse cx="40" cy="22" rx="14" ry="15" fill="#f0c8a0" stroke="#333" strokeWidth="2.5" />
      {/* Hair */}
      <path d="M26 18 Q30 6 40 4 Q50 6 54 18" fill="#4a3728" stroke="#333" strokeWidth="2" />
      {/* Angry eyes */}
      <ellipse cx="34" cy="20" rx="3" ry="3" fill="white" stroke="#333" strokeWidth="1.5" />
      <ellipse cx="46" cy="20" rx="3" ry="3" fill="white" stroke="#333" strokeWidth="1.5" />
      <ellipse cx="34" cy="20" rx="1.5" ry="1.5" fill="#333" />
      <ellipse cx="46" cy="20" rx="1.5" ry="1.5" fill="#333" />
      {/* Angry eyebrows */}
      <line x1="29" y1="14" x2="37" y2="16" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="51" y1="14" x2="43" y2="16" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      {/* Open mouth (yelling) */}
      <ellipse cx="40" cy="29" rx="5" ry="3" fill="#c0392b" stroke="#333" strokeWidth="1.5" />
      {/* Body */}
      <rect x="24" y="36" width="32" height="44" rx="4" fill="#5a5a5a" stroke="#333" strokeWidth="2.5" />
      {/* Right arm pointing */}
      <line x1="56" y1="44" x2="74" y2="36" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      {/* Pointing finger */}
      <circle cx="76" cy="34" r="3" fill="#f0c8a0" stroke="#333" strokeWidth="1.5" />
      {/* Left arm on hip */}
      <path d="M24 50 L12 56 L18 68" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Legs */}
      <rect x="28" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      <rect x="42" y="78" width="10" height="28" rx="3" fill="#3a3a5a" stroke="#333" strokeWidth="2" />
      <ellipse cx="33" cy="108" rx="8" ry="4" fill="#333" />
      <ellipse cx="47" cy="108" rx="8" ry="4" fill="#333" />
      {/* Anger symbol */}
      <text x="56" y="10" fontSize="12" fill="var(--danger)">💢</text>
    </g>
  );
}
