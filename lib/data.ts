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
  return recipes;
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
