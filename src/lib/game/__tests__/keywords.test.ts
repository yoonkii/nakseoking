import { describe, it, expect } from "vitest";
import { pickKeywords, KEYWORDS } from "../keywords";

describe("pickKeywords", () => {
  it("returns the requested number of keywords", () => {
    const result = pickKeywords(3);
    expect(result).toHaveLength(3);
  });

  it("returns unique keywords", () => {
    const result = pickKeywords(10);
    const words = result.map((k) => k.word);
    expect(new Set(words).size).toBe(10);
  });

  it("excludes specified keywords", () => {
    const exclude = ["사과", "바나나", "수박"];
    const result = pickKeywords(5, exclude);
    const words = result.map((k) => k.word);
    for (const ex of exclude) {
      expect(words).not.toContain(ex);
    }
  });

  it("each keyword has word, emoji, and category", () => {
    const result = pickKeywords(5);
    for (const k of result) {
      expect(k.word).toBeTruthy();
      expect(k.emoji).toBeTruthy();
      expect(k.category).toBeTruthy();
    }
  });

  it("returns fewer than requested when pool is exhausted", () => {
    const exclude = KEYWORDS.map((k) => k.word).slice(0, KEYWORDS.length - 2);
    const result = pickKeywords(5, exclude);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe("KEYWORDS", () => {
  it("has at least 50 keywords", () => {
    expect(KEYWORDS.length).toBeGreaterThanOrEqual(50);
  });

  it("all keywords have unique words", () => {
    const words = KEYWORDS.map((k) => k.word);
    expect(new Set(words).size).toBe(words.length);
  });
});
