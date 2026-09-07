import { z } from "zod";

/*
  Every number in data/ passes through these schemas at build time and in tests.
  Rules:
  - Every recipe and every grinder band carries a Source with a URL.
  - Water in a step is a rule (times dose, share of total, or grams), never a hard number,
    so scaling is data, not code.
  - Grinder "microns per click" is burr travel, not particle size; it is informational.
*/

export const Locale = z.enum(["en", "pt-BR"]);
export type Locale = z.infer<typeof Locale>;

export const LocalizedText = z.object({
  en: z.string().min(1),
  "pt-BR": z.string().min(1),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

export const SourceKind = z.enum(["primary", "transcription", "community"]);

export const Source = z.object({
  url: z.url(),
  title: z.string().min(1),
  year: z.number().int().min(1950).max(2100).optional(),
  kind: SourceKind,
  /** Where sources disagree, say so here. Shown in the UI as a footnote. */
  notes: z.string().optional(),
});
export type Source = z.infer<typeof Source>;

/** Brew methods the wizard can run. Only v60 and aeropress ship at launch. */
export const Method = z.enum([
  "v60",
  "aeropress",
  "chemex",
  "frenchpress",
  "moka",
  "espresso",
]);
export type Method = z.infer<typeof Method>;

/** Grind bands as manufacturers and Honest Coffee Guide publish them. */
export const GrindBand = z.enum([
  "turkish",
  "espresso",
  "moka",
  "aeropress",
  "v60",
  "pourover",
  "chemex",
  "frenchpress",
  "coldbrew",
]);
export type GrindBand = z.infer<typeof GrindBand>;

export const GrindTexture = z.enum([
  "extra-fine",
  "fine",
  "medium-fine",
  "medium",
  "medium-coarse",
  "coarse",
]);
export type GrindTexture = z.infer<typeof GrindTexture>;

export const RoastLevel = z.enum([
  "light",
  "medium-light",
  "medium",
  "medium-dark",
  "dark",
]);
export type RoastLevel = z.infer<typeof RoastLevel>;

export const Process = z.enum([
  "washed",
  "natural",
  "honey",
  "anaerobic",
  "carbonic",
  "cofermented",
]);
export type Process = z.infer<typeof Process>;

export const StepAction = z.enum([
  "rinse",
  "bloom",
  "pour",
  "stir",
  "swirl",
  "wait",
  "add",
  "cap",
  "flip",
  "press",
  "dilute",
  "drawdown",
  "serve",
]);
export type StepAction = z.infer<typeof StepAction>;

/** Cumulative water target for a step, as a rule on the dose or the total. */
export const StepWater = z.union([
  z.object({ times: z.number().positive() }), // bloom: 2 × dose
  z.object({ share: z.number().min(0).max(1) }), // pour to 60 % of total
  z.object({ grams: z.number().positive() }), // fixed grams at the default dose (scaled if scaling = dose-multiples)
]);
export type StepWater = z.infer<typeof StepWater>;

export const Step = z.object({
  /** seconds from start */
  at: z.number().min(0),
  /** seconds from start when the action ends (pours, presses); omit for instant actions */
  until: z.number().min(0).optional(),
  action: StepAction,
  water: StepWater.optional(),
  /** Text may use {water} (cumulative g), {add} (g added in this step), {dose}, {total} */
  text: LocalizedText,
  note: LocalizedText.optional(),
  /** Label for the 3D / GSAP timeline */
  cue: z.string().optional(),
});
export type Step = z.infer<typeof Step>;

export const RecipeStyle = z.enum([
  "pulse",
  "two-pour",
  "continuous",
  "concentrate",
  "immersion",
]);

export const Recipe = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  method: Method,
  name: z.string().min(1),
  author: z.string().min(1),
  year: z.number().int().optional(),
  style: RecipeStyle,
  summary: LocalizedText,
  dose: z.object({
    default: z.number().positive(),
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  /** brew water = dose × ratio */
  ratio: z.number().positive(),
  /** Water added after the brew (AeroPress concentrate recipes). times = × dose, grams = at default dose. */
  bypass: z
    .object({
      water: StepWater,
      tempC: z.number().optional(),
    })
    .optional(),
  grind: z.object({
    band: GrindBand,
    /** 0 = finest end of the band, 1 = coarsest end */
    pos: z.number().min(0).max(1),
    texture: GrindTexture,
    microns: z.number().positive().optional(),
    note: z.string().optional(),
  }),
  temperature: z.object({
    default: z.number().min(60).max(100),
    byRoast: z
      .partialRecord(RoastLevel, z.number().min(60).max(100))
      .optional(),
    note: z.string().optional(),
  }),
  steps: z.array(Step).min(2),
  totalSeconds: z.number().positive(),
  /** linear: every water rule scales with dose. fixed: only the default dose is valid. dose-multiples: gram steps scale with dose/default. */
  scaling: z.enum(["linear", "fixed", "dose-multiples"]),
  options: z
    .object({
      orientation: z.enum(["upright", "inverted"]).optional(),
      filter: z.string().optional(),
      model: z.string().optional(),
      iced: z.object({ iceGrams: z.number().positive() }).optional(),
    })
    .optional(),
  source: Source,
  alsoSee: z.array(Source).optional(),
});
export type Recipe = z.infer<typeof Recipe>;

export const Adjustment = z.enum(["stepped", "stepless", "labelled", "dual"]);
export const Notation = z.enum([
  "clicks", // "26 clicks"
  "rot.num.tick", // 1Zpresso "0.8.5" = 0 rotations, 8 numbers, 5 ticks
  "dial", // Baratza "setting 15"
  "dial.sub", // Fellow Ode "5.1" = number 5, first click after it
  "marks", // stepless ring "mark 42 from your zero"
  "rotations", // Eureka "1 turn + 4"
  "labels", // Wilfa Svart letters
]);
export type Notation = z.infer<typeof Notation>;

const Range = z.tuple([z.number(), z.number()]);

export const Band = z.object({
  official: Range.optional(),
  community: Range.optional(),
  source: Source,
  note: z.string().optional(),
});
export type Band = z.infer<typeof Band>;

export const Grinder = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  kind: z.enum(["hand", "electric"]),
  adjustment: Adjustment,
  notation: Notation,
  clicksPerRotation: z.number().positive().optional(),
  clicksPerNumber: z.number().positive().optional(),
  /** first printed number on a dial.sub grinder (Fellow Ode starts at 1) */
  dialStart: z.number().optional(),
  /** ordered labels for notation = labels; value is the index */
  labels: z.array(z.string()).optional(),
  /** burr travel per click in µm as stated by the maker. NOT particle size. */
  travelMicronsPerClick: z.number().positive().optional(),
  burr: z.string().optional(),
  /** usable min..max in the grinder's own units (clicks, marks, steps) */
  range: Range,
  bands: z.partialRecord(GrindBand, Band),
  zero: z.object({
    procedure: LocalizedText,
    toleranceClicks: z.number().min(0),
    /** grinding below this value can damage the burrs */
    unsafeBelow: z.number().optional(),
  }),
  espressoCapable: z.boolean(),
  notes: z.string().optional(),
  /** Honest Coffee Guide's linear particle-size model, used only as a fallback and as a secondary label */
  hcg: z
    .object({ micronRange: Range, ticks: z.number().positive() })
    .optional(),
});
export type Grinder = z.infer<typeof Grinder>;

/** Roast → temperature tables and process nudges. Process advice is community guidance and is flagged. */
export const Adjustments = z.object({
  roastTemperature: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      byRoast: z.record(RoastLevel, z.number()),
      source: Source,
    }),
  ),
  defaultRoastTable: z.string(),
  process: z.record(
    Process,
    z.object({
      label: LocalizedText,
      description: LocalizedText,
      tempDeltaC: z.number(),
      grindPosDelta: z.number(),
      ratioDelta: z.number(),
      source: Source.optional(),
    }),
  ),
});
export type Adjustments = z.infer<typeof Adjustments>;

export const Microns = z.object({
  bands: z.record(GrindBand, Range),
  textures: z.record(GrindTexture, Range),
  source: Source,
});
export type Microns = z.infer<typeof Microns>;

export const Extraction = z.object({
  chart: z.object({
    tdsAxis: Range,
    eyAxis: Range,
    sca: z.object({
      tds: Range,
      ey: Range,
      ratioGPerL: Range,
      tempC: Range,
      contactSeconds: Range,
      label: LocalizedText,
      source: Source,
    }),
    scae: z.object({ tds: Range, source: Source }),
  }),
  /** liquid retained in spent grounds, g per g of coffee, per method family */
  lrr: z.object({ percolation: z.number(), drip: z.number() }),
  corners: z.array(
    z.object({
      id: z.string(),
      tds: z.enum(["low", "high"]),
      ey: z.enum(["low", "high"]),
      attributes: z.array(LocalizedText),
    }),
  ),
  directions: z.array(
    z.object({
      attribute: LocalizedText,
      withTds: z.enum(["up", "down", "flat"]),
      withEy: z.enum(["up", "down", "flat"]),
      note: z.string().optional(),
    }),
  ),
  timeBands: z.array(
    z.object({
      method: Method,
      label: LocalizedText,
      seconds: Range,
      source: Source,
    }),
  ),
  facts: z.array(z.object({ text: LocalizedText, source: Source })),
  sources: z.array(Source),
});
export type Extraction = z.infer<typeof Extraction>;
