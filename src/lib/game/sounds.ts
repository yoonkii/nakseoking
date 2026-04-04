/**
 * Sound system using Web Audio API.
 * Synthesized sounds (no external assets needed).
 * Respects prefers-reduced-motion.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function shouldPlaySound(): boolean {
  if (typeof window === "undefined") return false;
  // Respect reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

/**
 * Chalk scratching sound (during SAFE state).
 * White noise filtered to sound like chalk on a board.
 */
export function playChalkSound(duration = 0.3): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate filtered noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter for chalk-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

/**
 * "도-도-솔!" warning signal (during TELL state).
 * Musical pattern: C-C-G ascending, like a teacher's warning chant.
 * Speed is randomized each time (fast = scary, slow = tense buildup).
 */
export function playWarningSound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();

  // C4=262, G4=392. "도-도-솔!"
  const notes = [262, 262, 392];
  // Random speed: fast (80ms) to slow (200ms) per note
  const noteGap = 80 + Math.random() * 120;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + i * (noteGap / 1000);
    const duration = noteGap / 1000 * 0.8;

    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

/**
 * Danger sound (teacher fully turns around).
 * Sharp "BANG!" — one loud staccato hit.
 */
export function playDangerSound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();

  // Low thump + high snap together = "야!"
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();

  osc1.type = "square";
  osc1.frequency.value = 150; // low thump
  osc2.type = "sawtooth";
  osc2.frequency.value = 800; // high snap

  gain1.gain.setValueAtTime(0.35, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  gain2.gain.setValueAtTime(0.2, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start();
  osc1.stop(ctx.currentTime + 0.15);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.08);
}

/**
 * Relief sound (danger passes, back to safe).
 * Gentle descending tone = "phew!"
 */
export function playReliefSound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

/**
 * Caught sound (player detected by teacher).
 * Harsh buzzer.
 */
export function playCaughtSound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.value = 150;

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

/**
 * Submit sound (drawing submitted for evaluation).
 * Quick ascending chime.
 */
export function playSubmitSound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();

  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
}

/**
 * Score reveal sound. Pitch changes based on score.
 */
export function playScoreRevealSound(score: number): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  // Higher score = higher pitch (happier sound)
  osc.frequency.value = score >= 7 ? 523 : score >= 5 ? 392 : 220;

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);

  // For high scores, add a cheerful second note
  if (score >= 7) {
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 659; // E5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.4);
  }
}

/**
 * Buzzer for caught/out during scoring reveal.
 */
export function playOutBuzzer(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 100;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

/**
 * Victory fanfare (winner announced).
 */
export function playVictorySound(): void {
  if (!shouldPlaySound()) return;
  const ctx = getAudioContext();

  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}
