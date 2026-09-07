import { EMPTY_SELECTION, type Selection } from "./machine";
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
