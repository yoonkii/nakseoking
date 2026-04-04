import type { TeacherState, TimelineEvent } from "./timeline";

export type PlayerStatus = "alive" | "out" | "spectating";
export type GameStatus = "lobby" | "playing" | "finished";
export type PlayerActivity = "drawing" | "stopped" | "out";

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  status: PlayerStatus;
  isHost: boolean;
  activity: PlayerActivity;
  score: number;
}

export interface Round {
  number: number;
  keyword: { word: string; emoji: string };
  timeline: TimelineEvent[];
  startedAt: number; // Date.now() server time
}

export interface SubmissionResult {
  playerId: string;
  score: number;
  comment: string;
  passed: boolean;
}

export interface GameState {
  roomCode: string;
  status: GameStatus;
  players: Player[];
  currentRound: Round | null;
  roundNumber: number;
  totalRounds: number;
  results: RoundResult[];
}

export interface RoundResult {
  roundNumber: number;
  keyword: string;
  rankings: {
    playerId: string;
    nickname: string;
    score: number;
    time: number; // ms to submit
    caught: boolean;
  }[];
}

// Avatars for players
export const PLAYER_AVATARS = ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵"];
