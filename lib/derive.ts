import { adjustForBean, type BeanAdjustment } from "./engine/bean";
import { gridToSetting, type Setting } from "./engine/grind";
import {
  buildSchedule,
  DoseOutOfRangeError,
  type Schedule,
} from "./engine/schedule";
import type { Selection } from "./machine";
import type {
  Adjustments,
  Extraction,
  Grinder,
  Microns,
  Recipe,
} from "./schema";

/** The data the client needs. Loaded on the server, passed as props, never fetched. */
export interface ClientCatalog {
  recipes: Recipe[];
  grinders: Grinder[];
  adjustments: Adjustments;
  microns: Microns;
  extraction: Extraction;
}

export interface Derived {
  recipe?: Recipe;
  grinder?: Grinder;
  dose: number;
  schedule?: Schedule;
  doseError?: { min: number; max: number };
  setting?: Setting;
  bean?: BeanAdjustment;
  /** temperature after the optional process nudge */
  tempC?: number;
  /** grind position after the optional process nudge */
  grindPos?: number;
  ratio?: number;
}

/** Everything the screens show, computed from the selection. Pure; safe on server and client. */
export function derive(catalog: ClientCatalog, s: Selection): Derived {
  const recipe = s.recipeId
    ? catalog.recipes.find((r) => r.id === s.recipeId)
    : undefined;
  const grinder = s.grinderId
    ? catalog.grinders.find((g) => g.id === s.grinderId)
    : undefined;
  const dose = s.dose ?? recipe?.dose.default ?? 15;

  const out: Derived = { recipe, grinder, dose };
  if (!recipe) return out;

  const bean = adjustForBean(
    recipe,
    { roast: s.roast, process: s.process },
    catalog.adjustments,
  );
  out.bean = bean;
  const nudge = s.nudge && bean.suggestions ? bean.suggestions : null;
  out.tempC = Math.round(bean.tempC + (nudge?.tempDeltaC ?? 0));
  out.grindPos = clamp01(
    grindPosition(recipe, catalog.microns) + (nudge?.grindPosDelta ?? 0),
  );
  out.ratio = recipe.ratio + (nudge?.ratioDelta ?? 0);

  const nudgedRecipe = nudge ? { ...recipe, ratio: out.ratio } : recipe;
  try {
    out.schedule = buildSchedule(nudgedRecipe, dose);
  } catch (e) {
    if (e instanceof DoseOutOfRangeError)
      out.doseError = { min: e.min, max: e.max };
    else throw e;
  }

  if (grinder) {
    out.setting = gridToSetting(grinder, recipe.grind.band, out.grindPos, {
      offset: s.grindOffset,
      microns: catalog.microns.bands,
    });
  }
  return out;
}

/**
 * Where the recipe sits inside its band, 0 = finest, 1 = coarsest. A stated particle size
 * is mapped into the band's micron window (Onyx 550 µm, Stanica 870 µm, Kasuya 800 µm);
 * otherwise the position entered from the author's texture words is used.
 */
export function grindPosition(recipe: Recipe, microns: Microns): number {
  const u = recipe.grind.microns;
  const window = microns.bands[recipe.grind.band];
  if (u === undefined || !window) return recipe.grind.pos;
  const [lo, hi] = window;
  return clamp01((u - lo) / Math.max(hi - lo, 1));
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
