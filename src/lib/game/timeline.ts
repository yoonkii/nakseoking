export type TeacherState = "safe" | "tell" | "danger";

export interface TimelineEvent {
  state: TeacherState;
  at: number; // ms offset from round start
}

interface TimelineOptions {
  roundNumber: number;    // 1-based, affects difficulty
  totalRounds: number;
  fakeTellChance?: number; // 0-1, increases with round
}

/**
 * Pre-compute the teacher state machine timeline for a round.
 * Returns an array of state transitions with timestamps.
 *
 * Pattern: SAFE → TELL → DANGER → SAFE → ... (repeat)
 * With occasional FAKE TELL: SAFE → TELL → SAFE (no DANGER)
 *
 * Difficulty scaling:
 * - SAFE duration decreases with round number
 * - FAKE TELL frequency increases with round number
 */
export function generateTimeline(options: TimelineOptions): TimelineEvent[] {
  const { roundNumber, totalRounds, fakeTellChance: customFakeTellChance } = options;
  const events: TimelineEvent[] = [];
  let currentTime = 0;
  const roundDuration = 60_000; // 60 seconds per round

  // Difficulty scaling
  const progress = (roundNumber - 1) / Math.max(totalRounds - 1, 1); // 0 to 1
  const safeMin = lerp(8000, 5000, progress);
  const safeMax = lerp(15000, 8000, progress);
  const fakeTellChance = customFakeTellChance ?? lerp(0.1, 0.35, progress);

  // Start with SAFE
  events.push({ state: "safe", at: currentTime });

  while (currentTime < roundDuration) {
    // SAFE phase
    const safeDuration = randomBetween(safeMin, safeMax);
    currentTime += safeDuration;

    if (currentTime >= roundDuration) break;

    // TELL phase
    events.push({ state: "tell", at: currentTime });
    const thisTellDuration = randomBetween(500, 1000);
    currentTime += thisTellDuration;

    if (currentTime >= roundDuration) break;

    // Is this a fake tell?
    if (Math.random() < fakeTellChance) {
      // Fake tell: go back to SAFE
      events.push({ state: "safe", at: currentTime });
    } else {
      // Real danger
      events.push({ state: "danger", at: currentTime });
      const thisDangerDuration = randomBetween(3000, 5000);
      currentTime += thisDangerDuration;

      if (currentTime >= roundDuration) break;

      // Back to SAFE
      events.push({ state: "safe", at: currentTime });
    }
  }

  return events;
}

/**
 * Get the current teacher state at a given time offset.
 */
export function getStateAtTime(timeline: TimelineEvent[], timeOffset: number): TeacherState {
  let state: TeacherState = "safe";
  for (const event of timeline) {
    if (event.at <= timeOffset) {
      state = event.state;
    } else {
      break;
    }
  }
  return state;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
