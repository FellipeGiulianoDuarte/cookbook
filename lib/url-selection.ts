import { EMPTY_SELECTION, type Selection } from "./machine";
import type { Grinder, Recipe } from "./schema";
import type { UrlState } from "./url";

/** URL parameters → wizard selection. Unknown ids are kept; the wizard validates them against the catalog. */
export function selectionFromUrl(u: UrlState): Selection {
  return {
    ...EMPTY_SELECTION,
    method: u.m ?? undefined,
    recipeId: u.r ?? undefined,
    grinderId: u.g ?? undefined,
    dose: u.d ?? undefined,
    roast: u.roast,
    process: u.proc ?? undefined,
    orientation: u.orient ?? undefined,
    grindOffset: u.off,
    nudge: u.nudge,
  };
}

/** Wizard selection → URL parameters. `null` clears a key. */
export function urlFromSelection(s: Selection) {
  return {
    m: s.method ?? null,
    r: s.recipeId ?? null,
    g: s.grinderId ?? null,
    d: s.dose ?? null,
    roast: s.roast,
    proc: s.process ?? null,
    orient: s.orientation ?? null,
    off: s.grindOffset,
    nudge: s.nudge,
  };
}

/**
 * Drop what a link cannot support: ids the catalog does not know (old links, typos), a
 * recipe that belongs to another method, and a dose with no recipe to scale. The wizard
 * then lands on the first step that still needs an answer instead of a dead end.
 */
export function sanitizeSelection(
  s: Selection,
  catalog: {
    recipes: Pick<Recipe, "id" | "method">[];
    grinders: Pick<Grinder, "id">[];
  },
): Selection {
  const out = { ...s };
  const recipe = out.recipeId
    ? catalog.recipes.find((r) => r.id === out.recipeId)
    : undefined;
  if (!recipe || (out.method && recipe.method !== out.method)) {
    out.recipeId = undefined;
    out.dose = undefined;
    out.orientation = undefined;
  } else if (!out.method) {
    out.method = recipe.method;
  }
  if (out.grinderId && !catalog.grinders.some((g) => g.id === out.grinderId))
    out.grinderId = undefined;
  return out;
}
