import type { GrindBand, Grinder } from "../schema";

/*
  Grind conversion.
  Input: a position 0..1 inside a brew-method band (0 = finest end, 1 = coarsest end).
  Output: a setting in the grinder's own units and notation, with a tolerance and flags.

  It interpolates inside the grinder's OFFICIAL band for that method. It never divides a
  micron value by the maker's "microns per click" figure: that figure is burr travel, and
  it differs from particle-size estimates by about 3×.
*/

export type Basis = "official" | "community" | "estimated";

export type Setting =
  | {
      kind: "ok";
      value: number;
      basis: Basis;
      band: [number, number];
      tolerance: number;
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
  if (b?.official) {
    [lo, hi] = b.official;
    basis = "official";
  } else if (b?.community) {
    [lo, hi] = b.community;
    basis = "community";
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
    outOfRange: value < rMin || value > rMax,
    unsafe:
      grinder.zero.unsafeBelow !== undefined &&
      value < grinder.zero.unsafeBelow,
    text: formatted.text,
    detail: formatted.detail,
  };
}

/** Render a value in the grinder's own notation. */
export function formatSetting(
  g: Grinder,
  value: number,
): { text: string; detail?: string } {
  switch (g.notation) {
    case "clicks":
      return { text: `${value} clicks` };
    case "rot.num.tick": {
      const R = g.clicksPerRotation ?? 1;
      const N = g.clicksPerNumber ?? 1;
      const rotations = Math.floor(value / R);
      const rem = value - rotations * R;
      const numbers = Math.floor(rem / N);
      const ticks = rem - numbers * N;
      return {
        text: `${rotations}.${numbers}.${ticks}`,
        detail: `${value} clicks from zero`,
      };
    }
    case "dial":
      return { text: `setting ${value}` };
    case "dial.sub": {
      const N = g.clicksPerNumber ?? 1;
      const start = g.dialStart ?? 0;
      const number = start + Math.floor(value / N);
      const sub = value - Math.floor(value / N) * N;
      return {
        text: sub === 0 ? `${number}` : `${number}.${sub}`,
        detail: `step ${value}`,
      };
    }
    case "marks":
      return {
        text: `mark ${trimNumber(value)}`,
        detail: "counted from your own zero",
      };
    case "rotations": {
      const R = g.clicksPerRotation ?? 1;
      const turns = Math.floor(value / R);
      const rem = trimNumber(value - turns * R);
      return {
        text:
          turns === 0
            ? `${rem}`
            : `${turns} turn${turns > 1 ? "s" : ""} + ${rem}`,
        detail: "from your own zero",
      };
    }
    case "labels": {
      const labels = g.labels ?? [];
      const idx = clamp(Math.round(value), 0, Math.max(0, labels.length - 1));
      return {
        text: labels[idx] ?? `${value}`,
        detail: `position ${idx + 1} of ${labels.length}`,
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
