import type { GrindBand, Grinder } from "../schema";

/*
  Grind conversion.
  Input: a position 0..1 inside a brew-method band (0 = finest end, 1 = coarsest end).
  Output: a setting in the grinder's own units and notation, with a tolerance and flags.

  It interpolates inside the grinder's COMMUNITY band for that method (Honest Coffee Guide
  and reviewer charts, which place every grinder on one shared particle-size scale), and
  falls back to the maker's own band, then to the Honest Coffee Guide linear model. The
  maker's band is returned separately as a reference. Makers' bands are not comparable with
  each other: Comandante's pour-over band spans medium-fine to coarse, Timemore's printed
  guide covers only the centre, and Baratza and Kingrinder publish a single point, so the
  same recipe position would mean a different texture on each grinder.

  It never divides a micron value by the maker's "microns per click" figure: that figure is
  burr travel, and it differs from particle-size estimates by about 3×.
*/

export type Basis = "official" | "community" | "estimated";

export type Setting =
  | {
      kind: "ok";
      value: number;
      basis: Basis;
      band: [number, number];
      tolerance: number;
      /** the maker's own band for this method, shifted by the offset, when it exists */
      official?: [number, number];
      outOfRange: boolean;
      unsafe: boolean;
      text: string;
      detail?: string;
    }
  | { kind: "unknown"; reason: "no-band" | "not-capable" };

/** Honest Coffee Guide micron ranges per band; used only for the estimated fallback. */
export type MicronBands = Partial<Record<GrindBand, [number, number]>>;

export function gridToSetting(
  grinder: Grinder,
  band: GrindBand,
  pos: number,
  options: { offset?: number; microns?: MicronBands } = {},
): Setting {
  const p = clamp(pos, 0, 1);
  const offset = options.offset ?? 0;

  if (band === "espresso" && !grinder.espressoCapable) {
    return { kind: "unknown", reason: "not-capable" };
  }

  let lo: number;
  let hi: number;
  let basis: Basis;
  const b = grinder.bands[band];
  if (b?.community) {
    [lo, hi] = b.community;
    basis = "community";
  } else if (b?.official) {
    [lo, hi] = b.official;
    basis = "official";
  } else if (grinder.hcg && options.microns?.[band]) {
    const [uMin, uMax] = options.microns[band];
    const [gMin, gMax] = grinder.hcg.micronRange;
    const toTick = (u: number) =>
      ((u - gMin) / (gMax - gMin)) * grinder.hcg!.ticks;
    lo = toTick(uMin);
    hi = toTick(uMax);
    basis = "estimated";
  } else {
    return { kind: "unknown", reason: "no-band" };
  }

  const raw = lo + p * (hi - lo) + offset;
  const value =
    grinder.adjustment === "stepless" ? roundTo(raw, 0.5) : Math.round(raw);
  const [rMin, rMax] = grinder.range;
  const formatted = formatSetting(grinder, value);

  return {
    kind: "ok",
    value,
    basis,
    band: [round1(lo + offset), round1(hi + offset)],
    tolerance: grinder.zero.toleranceClicks,
    official: b?.official
      ? [round1(b.official[0] + offset), round1(b.official[1] + offset)]
      : undefined,
    outOfRange: value < rMin || value > rMax,
    unsafe:
      grinder.zero.unsafeBelow !== undefined &&
      value < grinder.zero.unsafeBelow,
    text: formatted.text,
    detail: formatted.detail,
  };
}

/** The words a setting is written with; the UI passes the translated set. */
export interface SettingWords {
  clicks: string;
  setting: string;
  mark: string;
  turn: string;
  turns: string;
  fromZero: string;
  countedFromZero: string;
  clicksFromZero: string;
  step: string;
  /** "position {i} of {n}" */
  position: (i: number, n: number) => string;
}

export const ENGLISH_WORDS: SettingWords = {
  clicks: "clicks",
  setting: "setting",
  mark: "mark",
  turn: "turn",
  turns: "turns",
  fromZero: "from your own zero",
  countedFromZero: "counted from your own zero",
  clicksFromZero: "clicks from zero",
  step: "step",
  position: (i, n) => `position ${i} of ${n}`,
};

/** Render a value in the grinder's own notation. */
export function formatSetting(
  g: Grinder,
  value: number,
  w: SettingWords = ENGLISH_WORDS,
): { text: string; detail?: string } {
  switch (g.notation) {
    case "clicks":
      return { text: `${value} ${w.clicks}` };
    case "rot.num.tick": {
      const R = g.clicksPerRotation ?? 1;
      const N = g.clicksPerNumber ?? 1;
      const rotations = Math.floor(value / R);
      const rem = value - rotations * R;
      const numbers = Math.floor(rem / N);
      const ticks = rem - numbers * N;
      return {
        text: `${rotations}.${numbers}.${ticks}`,
        detail: `${value} ${w.clicksFromZero}`,
      };
    }
    case "dial":
      return { text: `${w.setting} ${value}` };
    case "dial.sub": {
      const N = g.clicksPerNumber ?? 1;
      const start = g.dialStart ?? 0;
      const number = start + Math.floor(value / N);
      const sub = value - Math.floor(value / N) * N;
      return {
        text: sub === 0 ? `${number}` : `${number}.${sub}`,
        detail: `${w.step} ${value}`,
      };
    }
    case "marks":
      return {
        text: `${w.mark} ${trimNumber(value)}`,
        detail: w.countedFromZero,
      };
    case "rotations": {
      const R = g.clicksPerRotation ?? 1;
      const turns = Math.floor(value / R);
      const rem = trimNumber(value - turns * R);
      return {
        text:
          turns === 0
            ? `${rem}`
            : `${turns} ${turns > 1 ? w.turns : w.turn} + ${rem}`,
        detail: w.fromZero,
      };
    }
    case "labels": {
      const labels = g.labels ?? [];
      const idx = clamp(Math.round(value), 0, Math.max(0, labels.length - 1));
      return {
        text: labels[idx] ?? `${value}`,
        detail: w.position(idx + 1, labels.length),
      };
    }
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function roundTo(v: number, step: number) {
  return Math.round(v / step) * step;
}
function round1(v: number) {
  return Math.round(v * 10) / 10;
}
function trimNumber(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
