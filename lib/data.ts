import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  Adjustments,
  Extraction,
  type GrindBand,
  Grinder,
  type Method,
  Microns,
  Recipe,
} from "./schema";

/*
  Server-side loader. Reads and validates every JSON file under data/ once per process.
  The client receives validated objects as props; it never reads files.
*/

const ROOT = join(process.cwd(), "data");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listJson(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => join(dir, f));
}

function parseAll<T>(
  files: string[],
  schema: { parse: (v: unknown) => T },
): T[] {
  return files.map((file) => {
    try {
      return schema.parse(readJson(file));
    } catch (err) {
      throw new Error(
        `${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  });
}

export const RECIPE_METHODS: Method[] = ["v60", "aeropress"];

export function loadRecipes(): Recipe[] {
  const files = RECIPE_METHODS.flatMap((m) =>
    listJson(join(ROOT, "recipes", m)),
  );
  const recipes = parseAll(files, Recipe);
  assertUniqueIds(recipes, "recipe");
  return recipes.sort(
    (a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name),
  );
}

/** Display order: the recipes most people look for first. Anything unlisted follows alphabetically. */
const FEATURED_ORDER = [
  "v60-hoffmann-ultimate",
  "v60-hoffmann-1cup",
  "v60-kasuya-46",
  "v60-rao-2022",
  "v60-winton-five-pour",
  "v60-hedrick-one-and-done",
  "v60-onyx-guide",
  "v60-hario-official",
  "aeropress-hoffmann-ultimate",
  "aeropress-official-current",
  "aeropress-wendelboe",
  "aeropress-adler-original",
  "aeropress-wac-2025-pop",
  "aeropress-wac-2024-stanica",
  "aeropress-wac-2021-merikanto",
  "aeropress-official-japanese-iced",
];
function rank(id: string) {
  const i = FEATURED_ORDER.indexOf(id);
  return i === -1 ? FEATURED_ORDER.length : i;
}

export function loadGrinders(): Grinder[] {
  const grinders = parseAll(listJson(join(ROOT, "grinders")), Grinder);
  assertUniqueIds(grinders, "grinder");
  return grinders.sort((a, b) =>
    `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`),
  );
}

export function loadAdjustments(): Adjustments {
  return Adjustments.parse(readJson(join(ROOT, "adjustments.json")));
}

export function loadMicrons(): Microns {
  return Microns.parse(readJson(join(ROOT, "microns.json")));
}

export function loadExtraction(): Extraction {
  return Extraction.parse(readJson(join(ROOT, "extraction.json")));
}

export interface Catalog {
  recipes: Recipe[];
  grinders: Grinder[];
  adjustments: Adjustments;
  microns: Microns;
  extraction: Extraction;
}

let cache: Catalog | undefined;

export function loadCatalog(): Catalog {
  if (!cache || process.env.NODE_ENV !== "production") {
    cache = {
      recipes: loadRecipes(),
      grinders: loadGrinders(),
      adjustments: loadAdjustments(),
      microns: loadMicrons(),
      extraction: loadExtraction(),
    };
  }
  return cache;
}

function assertUniqueIds(items: { id: string }[], what: string) {
  const seen = new Set<string>();
  for (const it of items) {
    if (seen.has(it.id)) throw new Error(`duplicate ${what} id: ${it.id}`);
    seen.add(it.id);
  }
}

/** The grind band a brew method reads from when a recipe does not say otherwise. */
export const METHOD_BAND: Record<Method, GrindBand> = {
  v60: "v60",
  aeropress: "aeropress",
  chemex: "chemex",
  frenchpress: "frenchpress",
  moka: "moka",
  espresso: "espresso",
};
