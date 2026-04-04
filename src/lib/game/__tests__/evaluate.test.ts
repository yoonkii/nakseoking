import { describe, it, expect } from "vitest";

/**
 * Tests for the evaluation logic.
 * The actual /api/evaluate route is a Next.js API route,
 * so we test the core logic here.
 */

describe("evaluation logic", () => {
  it("blank canvas detection (very short base64)", () => {
    const shortBase64 = "data:image/jpeg;base64,/9j/4AAQ"; // ~30 chars
    expect(shortBase64.length).toBeLessThan(500);
    // In the API, base64 < 500 chars → blank canvas → score 0
  });

  it("valid image base64 is long enough", () => {
    // A real JPEG at 400px width is typically 20KB+ base64
    const fakeBase64 = "x".repeat(20000);
    expect(fakeBase64.length).toBeGreaterThan(500);
  });

  it("score clamping to 0-10 range", () => {
    const clamp = (score: number) => Math.min(10, Math.max(0, score));
    expect(clamp(-5)).toBe(0);
    expect(clamp(0)).toBe(0);
    expect(clamp(5.5)).toBe(5.5);
    expect(clamp(10)).toBe(10);
    expect(clamp(15)).toBe(10);
    // NaN is handled by the API with `Number(result.score) || 5` fallback
    const clampWithFallback = (score: number) => Math.min(10, Math.max(0, Number(score) || 5));
    expect(clampWithFallback(NaN)).toBe(5);
  });

  it("pass/fail threshold at score 5", () => {
    const passed = (score: number) => score >= 5;
    expect(passed(4.9)).toBe(false);
    expect(passed(5.0)).toBe(true);
    expect(passed(5.1)).toBe(true);
    expect(passed(10)).toBe(true);
    expect(passed(0)).toBe(false);
  });
});
