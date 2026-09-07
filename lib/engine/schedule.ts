import type { Recipe, Step } from "../schema";

export interface ScheduledStep extends Step {
  /** cumulative water in the brewer after this step, g */
  cumulative: number;
  /** water added in this step, g */
  added: number;
  /** total brew water, g */
  total: number;
  /** seconds this step lasts before the next one starts */
  durationSeconds: number;
}

export interface Schedule {
  dose: number;
  water: number;
  bypass?: { grams: number; tempC?: number };
  /** water + bypass + melted ice: what ends up in the cup before absorption */
  beverageTarget: number;
  steps: ScheduledStep[];
  totalSeconds: number;
}

export class DoseOutOfRangeError extends Error {
  constructor(
    public readonly recipeId: string,
    public readonly dose: number,
    public readonly min: number,
    public readonly max: number,
  ) {
    super(`${recipeId}: dose ${dose} g is outside ${min}–${max} g`);
  }
}

export function resolveWater(
  rule: NonNullable<Step["water"]>,
  ctx: {
    dose: number;
    total: number;
    defaultDose: number;
    scaling: Recipe["scaling"];
  },
): number {
  if ("times" in rule) return Math.round(ctx.dose * rule.times);
  if ("share" in rule) return Math.round(ctx.total * rule.share);
  // grams: fixed at the default dose; scale when the recipe says pours are dose multiples
  const factor =
    ctx.scaling === "dose-multiples" ? ctx.dose / ctx.defaultDose : 1;
  return Math.round(rule.grams * factor);
}

/** Absolute times, cumulative grams and durations for a recipe at a dose. */
export function buildSchedule(recipe: Recipe, dose: number): Schedule {
  const { min, max, default: defaultDose } = recipe.dose;
  if (recipe.scaling === "fixed" && dose !== defaultDose) {
    throw new DoseOutOfRangeError(recipe.id, dose, defaultDose, defaultDose);
  }
  if (dose < min || dose > max)
    throw new DoseOutOfRangeError(recipe.id, dose, min, max);

  const total = Math.round(dose * recipe.ratio);
  const ctx = { dose, total, defaultDose, scaling: recipe.scaling };

  let cumulative = 0;
  let gramsSoFar = 0;
  const steps: ScheduledStep[] = recipe.steps.map((step, i) => {
    let added = 0;
    if (step.water) {
      let next: number;
      if ("grams" in step.water) {
        gramsSoFar += resolveWater(step.water, ctx);
        next = gramsSoFar;
      } else {
        next = resolveWater(step.water, ctx);
      }
      next = Math.min(next, total);
      added = Math.max(0, next - cumulative);
      cumulative = Math.max(cumulative, next);
    }
    const nextAt = recipe.steps[i + 1]?.at ?? recipe.totalSeconds;
    return {
      ...step,
      cumulative,
      added,
      total,
      durationSeconds: Math.max(0, nextAt - step.at),
    };
  });

  const bypass = recipe.bypass
    ? {
        grams: resolveWater(recipe.bypass.water, ctx),
        tempC: recipe.bypass.tempC,
      }
    : undefined;
  const ice = recipe.options?.iced?.iceGrams ?? 0;

  return {
    dose,
    water: total,
    bypass,
    beverageTarget: total + (bypass?.grams ?? 0) + ice,
    steps,
    totalSeconds: recipe.totalSeconds,
  };
}

/** Fill {water}, {add}, {dose}, {total} placeholders in a step's text. */
export function fillStepText(
  text: string,
  step: ScheduledStep,
  dose: number,
): string {
  return text
    .replaceAll("{water}", String(step.cumulative))
    .replaceAll("{add}", String(step.added))
    .replaceAll("{dose}", String(dose))
    .replaceAll("{total}", String(step.total));
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
