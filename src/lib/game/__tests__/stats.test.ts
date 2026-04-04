import { describe, it, expect } from "vitest";
import { recordRound, recordGameEnd, type GameStats } from "../stats";

function freshStats(): GameStats {
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

describe("recordRound", () => {
  it("increments roundsPlayed", () => {
    const stats = freshStats();
    const updated = recordRound(stats, { score: 7, caught: false, keyword: "사과", won: false });
    expect(updated.roundsPlayed).toBe(1);
  });

  it("tracks caught count", () => {
    const stats = freshStats();
    const updated = recordRound(stats, { score: 0, caught: true, keyword: "사과", won: false });
    expect(updated.timesCaught).toBe(1);
    expect(updated.totalScore).toBe(0); // caught = no score added
  });

  it("updates best score", () => {
    let stats = freshStats();
    stats = recordRound(stats, { score: 7.5, caught: false, keyword: "사과", won: false });
    stats = recordRound(stats, { score: 9.2, caught: false, keyword: "바나나", won: true });
    expect(stats.bestScore).toBe(9.2);
  });

  it("tracks unique keywords drawn", () => {
    let stats = freshStats();
    stats = recordRound(stats, { score: 5, caught: false, keyword: "사과", won: false });
    stats = recordRound(stats, { score: 6, caught: false, keyword: "사과", won: false }); // duplicate
    stats = recordRound(stats, { score: 7, caught: false, keyword: "바나나", won: false });
    expect(stats.keywordsDrawn).toEqual(["사과", "바나나"]);
  });

  it("tracks wins", () => {
    let stats = freshStats();
    stats = recordRound(stats, { score: 8, caught: false, keyword: "고양이", won: true });
    expect(stats.wins).toBe(1);
  });
});

describe("recordGameEnd", () => {
  it("increments gamesPlayed", () => {
    const stats = freshStats();
    const updated = recordGameEnd(stats);
    expect(updated.gamesPlayed).toBe(1);
  });
});
