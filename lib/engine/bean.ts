import type { Adjustments, Process, Recipe, RoastLevel } from "../schema";

export interface BeanChoice {
  roast: RoastLevel;
  process?: Process;
}

export interface BeanAdjustment {
  tempC: number;
  tempSource: "recipe" | "table" | "recipe-default";
  tempTableId?: string;
  /** community-only nudges, shown as optional suggestions */
  suggestions: {
    tempDeltaC: number;
    grindPosDelta: number;
    ratioDelta: number;
    label?: { en: string; "pt-BR": string };
    description?: { en: string; "pt-BR": string };
  } | null;
}

/**
 * Temperature comes from the recipe's own roast table when it has one, else from the
 * default published table (Philocoffea), else the recipe default. Process nudges are
 * community guidance only; they are returned separately and never applied silently.
 */
export function adjustForBean(
  recipe: Recipe,
  bean: BeanChoice,
  adjustments: Adjustments,
): BeanAdjustment {
  let tempC = recipe.temperature.default;
  let tempSource: BeanAdjustment["tempSource"] = "recipe-default";
  let tempTableId: string | undefined;

  const own = recipe.temperature.byRoast?.[bean.roast];
  if (own !== undefined) {
    tempC = own;
    tempSource = "recipe";
  } else if (recipe.temperature.byRoast) {
    // recipe has a table but not this level: interpolate between neighbours
    const t = interpolateRoast(recipe.temperature.byRoast, bean.roast);
    if (t !== undefined) {
      tempC = t;
      tempSource = "recipe";
    }
  } else {
    const table = adjustments.roastTemperature.find(
      (t) => t.id === adjustments.defaultRoastTable,
    );
    if (table) {
      tempC = table.byRoast[bean.roast];
      tempSource = "table";
      tempTableId = table.id;
    }
  }

  const proc = bean.process ? adjustments.process[bean.process] : undefined;
  const suggestions =
    proc &&
    (proc.tempDeltaC !== 0 || proc.grindPosDelta !== 0 || proc.ratioDelta !== 0)
      ? {
          tempDeltaC: proc.tempDeltaC,
          grindPosDelta: proc.grindPosDelta,
          ratioDelta: proc.ratioDelta,
          label: proc.label,
          description: proc.description,
        }
      : null;

  return { tempC, tempSource, tempTableId, suggestions };
}

const ORDER: RoastLevel[] = [
  "light",
  "medium-light",
  "medium",
  "medium-dark",
  "dark",
];

function interpolateRoast(
  table: Partial<Record<RoastLevel, number>>,
  level: RoastLevel,
): number | undefined {
  const i = ORDER.indexOf(level);
  let lo: number | undefined;
  let hi: number | undefined;
  for (let k = i - 1; k >= 0; k--) {
    const v = table[ORDER[k]];
    if (v !== undefined) {
      lo = v;
      break;
    }
  }
  for (let k = i + 1; k < ORDER.length; k++) {
    const v = table[ORDER[k]];
    if (v !== undefined) {
      hi = v;
      break;
    }
  }
  if (lo !== undefined && hi !== undefined) return Math.round((lo + hi) / 2);
  return lo ?? hi;
}
