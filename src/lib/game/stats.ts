/**
 * Local game statistics stored in localStorage.
 * Tracks games played, wins, best scores, etc.
 */

const STATS_KEY = "nakseoking-stats";

export interface GameStats {
  gamesPlayed: number;
  roundsPlayed: number;
  wins: number;
  timesCaught: number;
  bestScore: number;
  totalScore: number;
  keywordsDrawn: string[];
  lastPlayed: string; // ISO date
}

function getDefaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    roundsPlayed: 0,
    wins: 0,
    timesCaught: 0,
    bestScore: 0,
    totalScore: 0,
    keywordsDrawn: [],
    lastPlayed: new Date().toISOString(),
  };
}

export function loadStats(): GameStats {
  if (typeof window === "undefined") return getDefaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getDefaultStats();
    return { ...getDefaultStats(), ...JSON.parse(raw) };
  } catch {
    return getDefaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage full or unavailable
  }
}

export function recordRound(
  stats: GameStats,
  opts: { score: number; caught: boolean; keyword: string; won: boolean }
): GameStats {
  const updated = { ...stats };
  updated.roundsPlayed++;
  if (opts.caught) updated.timesCaught++;
  if (!opts.caught) {
    updated.totalScore += opts.score;
    updated.bestScore = Math.max(updated.bestScore, opts.score);
  }
  if (opts.won) updated.wins++;
  if (!updated.keywordsDrawn.includes(opts.keyword)) {
    updated.keywordsDrawn.push(opts.keyword);
  }
  updated.lastPlayed = new Date().toISOString();
  return updated;
}

export function recordGameEnd(stats: GameStats): GameStats {
  return { ...stats, gamesPlayed: stats.gamesPlayed + 1 };
}
