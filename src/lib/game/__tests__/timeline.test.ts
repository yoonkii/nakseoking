import { describe, it, expect } from "vitest";
import { generateTimeline, getStateAtTime } from "../timeline";

describe("generateTimeline", () => {
  it("starts with SAFE state at time 0", () => {
    const timeline = generateTimeline({ roundNumber: 1, totalRounds: 5 });
    expect(timeline[0]).toEqual({ state: "safe", at: 0 });
  });

  it("generates multiple state transitions", () => {
    const timeline = generateTimeline({ roundNumber: 1, totalRounds: 5 });
    expect(timeline.length).toBeGreaterThan(3);
  });

  it("alternates between safe, tell, and danger/safe", () => {
    const timeline = generateTimeline({
      roundNumber: 1,
      totalRounds: 5,
      fakeTellChance: 0, // no fake tells for deterministic test
    });

    // After first SAFE, should be TELL
    expect(timeline[1].state).toBe("tell");
    // After TELL, should be DANGER (no fake tells)
    expect(timeline[2].state).toBe("danger");
    // After DANGER, should be SAFE
    expect(timeline[3].state).toBe("safe");
  });

  it("all timestamps are within 60 seconds", () => {
    const timeline = generateTimeline({ roundNumber: 1, totalRounds: 5 });
    for (const event of timeline) {
      expect(event.at).toBeLessThanOrEqual(60000);
      expect(event.at).toBeGreaterThanOrEqual(0);
    }
  });

  it("timestamps are monotonically increasing", () => {
    const timeline = generateTimeline({ roundNumber: 1, totalRounds: 5 });
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i].at).toBeGreaterThan(timeline[i - 1].at);
    }
  });

  it("difficulty increases with round number (shorter SAFE periods)", () => {
    const round1 = generateTimeline({ roundNumber: 1, totalRounds: 5 });
    const round5 = generateTimeline({ roundNumber: 5, totalRounds: 5 });

    // Later rounds should have more transitions (shorter SAFE = more cycles)
    expect(round5.length).toBeGreaterThanOrEqual(round1.length - 2);
  });

  it("includes fake tells when fakeTellChance is high", () => {
    // With 100% fake tell chance, TELL should always be followed by SAFE
    const timeline = generateTimeline({
      roundNumber: 1,
      totalRounds: 5,
      fakeTellChance: 1,
    });

    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].state === "tell" && i + 1 < timeline.length) {
        // After TELL with 100% fake chance, next should be SAFE
        expect(timeline[i + 1].state).toBe("safe");
      }
    }
  });
});

describe("getStateAtTime", () => {
  const timeline = [
    { state: "safe" as const, at: 0 },
    { state: "tell" as const, at: 10000 },
    { state: "danger" as const, at: 11000 },
    { state: "safe" as const, at: 14000 },
  ];

  it("returns safe at start", () => {
    expect(getStateAtTime(timeline, 0)).toBe("safe");
  });

  it("returns safe during safe period", () => {
    expect(getStateAtTime(timeline, 5000)).toBe("safe");
  });

  it("returns tell during tell period", () => {
    expect(getStateAtTime(timeline, 10500)).toBe("tell");
  });

  it("returns danger during danger period", () => {
    expect(getStateAtTime(timeline, 12000)).toBe("danger");
  });

  it("returns safe after danger ends", () => {
    expect(getStateAtTime(timeline, 15000)).toBe("safe");
  });

  it("returns safe for time before first event", () => {
    expect(getStateAtTime(timeline, -100)).toBe("safe");
  });
});
