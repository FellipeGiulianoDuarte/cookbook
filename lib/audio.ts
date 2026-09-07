"use client";

/*
  Beeps synthesised with an oscillator: no asset to load, and iOS unlocks audio on the
  same tap that starts the brew. `unlock()` must run inside a user gesture.
*/

let ctx: AudioContext | undefined;

export function unlockAudio(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    // A silent tick keeps iOS from suspending the context before the first beep.
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    return ctx;
  } catch {
    return undefined;
  }
}

export type Cue = "step" | "pour" | "done";

const PATTERN: Record<
  Cue,
  { freq: number; times: number; gap: number; length: number }
> = {
  step: { freq: 880, times: 1, gap: 0, length: 0.12 },
  pour: { freq: 988, times: 2, gap: 0.16, length: 0.1 },
  done: { freq: 660, times: 3, gap: 0.2, length: 0.18 },
};

export function beep(cue: Cue = "step", muted = false) {
  if (muted || !ctx) return;
  const p = PATTERN[cue];
  const t0 = ctx.currentTime + 0.01;
  for (let i = 0; i < p.times; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = p.freq;
    const start = t0 + i * (p.length + p.gap);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + p.length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + p.length + 0.02);
  }
}
