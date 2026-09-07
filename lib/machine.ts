import { assign, setup } from "xstate";
import type { Method, Process, RoastLevel } from "./schema";

/*
  Wizard machine: a linear list of steps with a selection in context.
  The brew timer is a separate machine (lib/brew-machine.ts) started from `summary`.
*/

export const WIZARD_STEPS = [
  "method",
  "recipe",
  "grinder",
  "amount",
  "bean",
  "options",
  "summary",
] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export interface Selection {
  method?: Method;
  recipeId?: string;
  grinderId?: string;
  dose?: number;
  roast: RoastLevel;
  process?: Process;
  orientation?: "upright" | "inverted";
  /** per-user click offset applied to every grinder setting */
  grindOffset: number;
}

export const EMPTY_SELECTION: Selection = { roast: "medium", grindOffset: 0 };

export type WizardEvent =
  | { type: "SELECT_METHOD"; method: Method }
  | { type: "SELECT_RECIPE"; recipeId: string }
  | { type: "SELECT_GRINDER"; grinderId: string }
  | { type: "SET_DOSE"; dose: number }
  | { type: "SET_BEAN"; roast?: RoastLevel; process?: Process }
  | { type: "SET_ORIENTATION"; orientation: "upright" | "inverted" }
  | { type: "SET_OFFSET"; offset: number }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "JUMP"; step: WizardStep };

/** Which steps are complete enough to move past. */
export function canLeave(step: WizardStep, s: Selection): boolean {
  switch (step) {
    case "method":
      return s.method !== undefined;
    case "recipe":
      return s.recipeId !== undefined;
    case "grinder":
      return s.grinderId !== undefined;
    case "amount":
      return s.dose !== undefined;
    default:
      return true;
  }
}

/** The first step that is not complete, given a selection restored from a URL. */
export function firstIncompleteStep(s: Selection): WizardStep {
  for (const step of WIZARD_STEPS) if (!canLeave(step, s)) return step;
  return "summary";
}

const jumpTargets = Object.fromEntries(
  WIZARD_STEPS.map((step) => [
    step,
    {
      guard: ({ event }: { event: WizardEvent }) =>
        event.type === "JUMP" && event.step === step,
      target: `.${step}`,
    },
  ]),
);

export const wizardMachine = setup({
  types: {
    context: {} as Selection,
    events: {} as WizardEvent,
    input: {} as
      | { selection?: Partial<Selection>; step?: WizardStep }
      | undefined,
  },
  guards: {
    complete: ({ context }, params: { step: WizardStep }) =>
      canLeave(params.step, context),
  },
  actions: {
    // Changing the method invalidates the recipe (recipes belong to a method).
    selectMethod: assign(({ context, event }) =>
      event.type === "SELECT_METHOD" && event.method !== context.method
        ? { method: event.method, recipeId: undefined, orientation: undefined }
        : {},
    ),
    selectRecipe: assign(({ event }) =>
      event.type === "SELECT_RECIPE" ? { recipeId: event.recipeId } : {},
    ),
    selectGrinder: assign(({ event }) =>
      event.type === "SELECT_GRINDER" ? { grinderId: event.grinderId } : {},
    ),
    setDose: assign(({ event }) =>
      event.type === "SET_DOSE" ? { dose: event.dose } : {},
    ),
    setBean: assign(({ context, event }) =>
      event.type === "SET_BEAN"
        ? {
            roast: event.roast ?? context.roast,
            process: event.process ?? context.process,
          }
        : {},
    ),
    setOrientation: assign(({ event }) =>
      event.type === "SET_ORIENTATION"
        ? { orientation: event.orientation }
        : {},
    ),
    setOffset: assign(({ event }) =>
      event.type === "SET_OFFSET" ? { grindOffset: event.offset } : {},
    ),
  },
}).createMachine({
  id: "wizard",
  context: ({ input }) => ({ ...EMPTY_SELECTION, ...input?.selection }),
  initial: "method",
  on: {
    SELECT_METHOD: { actions: "selectMethod" },
    SELECT_RECIPE: { actions: "selectRecipe" },
    SELECT_GRINDER: { actions: "selectGrinder" },
    SET_DOSE: { actions: "setDose" },
    SET_BEAN: { actions: "setBean" },
    SET_ORIENTATION: { actions: "setOrientation" },
    SET_OFFSET: { actions: "setOffset" },
    JUMP: Object.values(jumpTargets),
  },
  states: {
    method: {
      on: {
        NEXT: {
          guard: { type: "complete", params: { step: "method" } },
          target: "recipe",
        },
      },
    },
    recipe: {
      on: {
        NEXT: {
          guard: { type: "complete", params: { step: "recipe" } },
          target: "grinder",
        },
        BACK: "method",
      },
    },
    grinder: {
      on: {
        NEXT: {
          guard: { type: "complete", params: { step: "grinder" } },
          target: "amount",
        },
        BACK: "recipe",
      },
    },
    amount: {
      on: {
        NEXT: {
          guard: { type: "complete", params: { step: "amount" } },
          target: "bean",
        },
        BACK: "grinder",
      },
    },
    bean: { on: { NEXT: "options", BACK: "amount" } },
    options: { on: { NEXT: "summary", BACK: "bean" } },
    summary: { on: { BACK: "options" } },
  },
});
