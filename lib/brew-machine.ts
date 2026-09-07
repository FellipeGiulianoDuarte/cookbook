import { assign, setup } from "xstate";
import type { Schedule, ScheduledStep } from "./engine/schedule";

/*
  Brew timer. One machine per brew, created from a Schedule at START.
  Each step lasts `durationSeconds`; the delay is a function of context so pause and
  resume keep the remaining time. Timers live in the actor, never in setTimeout.
*/

export interface BrewContext {
  steps: ScheduledStep[];
  index: number;
  /** wall-clock ms when the current step (re)started */
  stepStartedAt: number;
  /** ms of the current step already spent before a pause */
  spentInStepMs: number;
  /** ms spent in all previous steps */
  elapsedBeforeStepMs: number;
  totalSeconds: number;
}

export type BrewEvent =
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SKIP" }
  | { type: "RESET" };

export interface BrewInput {
  schedule: Schedule;
  now?: () => number;
}

const clock = (input?: { now?: () => number }) => input?.now ?? Date.now;

export const brewMachine = setup({
  types: {
    context: {} as BrewContext & { now: () => number },
    events: {} as BrewEvent,
    input: {} as BrewInput,
  },
  delays: {
    stepRemaining: ({ context }) => {
      const step = context.steps[context.index];
      const total = (step?.durationSeconds ?? 0) * 1000;
      return Math.max(0, total - context.spentInStepMs);
    },
  },
  guards: {
    hasNext: ({ context }) => context.index + 1 < context.steps.length,
  },
  actions: {
    markStart: assign(({ context }) => ({ stepStartedAt: context.now() })),
    advance: assign(({ context }) => {
      const step = context.steps[context.index];
      return {
        index: context.index + 1,
        elapsedBeforeStepMs:
          context.elapsedBeforeStepMs + (step?.durationSeconds ?? 0) * 1000,
        spentInStepMs: 0,
        stepStartedAt: context.now(),
      };
    }),
    freeze: assign(({ context }) => ({
      spentInStepMs:
        context.spentInStepMs + (context.now() - context.stepStartedAt),
    })),
    /** Hook for the UI: beep, haptic, seek the 3D timeline. Provided via machine.provide(). */
    onStepEnter: () => {},
    onDone: () => {},
  },
}).createMachine({
  id: "brew",
  context: ({ input }) => ({
    steps: input.schedule.steps,
    index: 0,
    stepStartedAt: clock(input)(),
    spentInStepMs: 0,
    elapsedBeforeStepMs: 0,
    totalSeconds: input.schedule.totalSeconds,
    now: clock(input),
  }),
  initial: "running",
  states: {
    running: {
      entry: ["markStart", "onStepEnter"],
      after: {
        stepRemaining: [
          {
            guard: "hasNext",
            target: "running",
            actions: "advance",
            reenter: true,
          },
          { target: "done" },
        ],
      },
      on: {
        PAUSE: { target: "paused", actions: "freeze" },
        SKIP: [
          {
            guard: "hasNext",
            target: "running",
            actions: "advance",
            reenter: true,
          },
          { target: "done" },
        ],
      },
    },
    paused: {
      on: { RESUME: "running" },
    },
    done: {
      entry: "onDone",
      type: "final",
    },
  },
});

/** Elapsed brew time in ms at wall-clock `now`, for the visible clock. */
export function elapsedMs(
  ctx: BrewContext,
  running: boolean,
  now: number,
): number {
  const inStep = running
    ? ctx.spentInStepMs + (now - ctx.stepStartedAt)
    : ctx.spentInStepMs;
  return ctx.elapsedBeforeStepMs + inStep;
}
