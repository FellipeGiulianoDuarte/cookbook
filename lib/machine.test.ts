import { describe, expect, it } from "vitest";
import { createActor, SimulatedClock } from "xstate";
import { brewMachine, elapsedMs } from "./brew-machine";
import { loadRecipes } from "./data";
import { buildSchedule } from "./engine/schedule";
import { EMPTY_SELECTION, firstIncompleteStep, wizardMachine } from "./machine";

describe("wizard machine", () => {
  it("walks forward only when the step is complete", () => {
    const actor = createActor(wizardMachine, { input: {} }).start();
    expect(actor.getSnapshot().value).toBe("method");
    actor.send({ type: "NEXT" });
    expect(actor.getSnapshot().value).toBe("method"); // no method chosen yet
    actor.send({ type: "SELECT_METHOD", method: "v60" });
    actor.send({ type: "NEXT" });
    expect(actor.getSnapshot().value).toBe("recipe");
    actor.send({ type: "SELECT_RECIPE", recipeId: "v60-hoffmann-ultimate" });
    actor.send({ type: "NEXT" });
    actor.send({ type: "SELECT_GRINDER", grinderId: "comandante-c40" });
    actor.send({ type: "NEXT" });
    actor.send({ type: "SET_DOSE", dose: 30 });
    actor.send({ type: "NEXT" });
    actor.send({ type: "NEXT" });
    actor.send({ type: "NEXT" });
    expect(actor.getSnapshot().value).toBe("summary");
  });

  it("BACK returns one step and keeps the selection", () => {
    const actor = createActor(wizardMachine, {
      input: {
        selection: { method: "v60", recipeId: "r", grinderId: "g", dose: 15 },
      },
    }).start();
    actor.send({ type: "JUMP", step: "bean" });
    expect(actor.getSnapshot().value).toBe("bean");
    actor.send({ type: "BACK" });
    expect(actor.getSnapshot().value).toBe("amount");
    expect(actor.getSnapshot().context.dose).toBe(15);
  });

  it("changing the method clears the recipe", () => {
    const actor = createActor(wizardMachine, {
      input: { selection: { method: "v60", recipeId: "v60-x" } },
    }).start();
    actor.send({ type: "SELECT_METHOD", method: "aeropress" });
    expect(actor.getSnapshot().context.recipeId).toBeUndefined();
    actor.send({ type: "SELECT_METHOD", method: "aeropress" });
    expect(actor.getSnapshot().context.method).toBe("aeropress");
  });

  it("firstIncompleteStep resumes a deep link at the right place", () => {
    expect(firstIncompleteStep(EMPTY_SELECTION)).toBe("method");
    expect(firstIncompleteStep({ ...EMPTY_SELECTION, method: "v60" })).toBe(
      "recipe",
    );
    expect(
      firstIncompleteStep({
        ...EMPTY_SELECTION,
        method: "v60",
        recipeId: "r",
        grinderId: "g",
        dose: 15,
      }),
    ).toBe("summary");
  });
});

describe("brew machine", () => {
  const recipe = loadRecipes().find((r) => r.id === "v60-hoffmann-ultimate")!;
  const schedule = buildSchedule(recipe, 30);

  function start() {
    const clock = new SimulatedClock();
    let now = 0;
    const actor = createActor(brewMachine, {
      clock,
      input: { schedule, now: () => now },
    });
    const tick = (ms: number) => {
      now += ms;
      clock.increment(ms);
    };
    actor.start();
    return { actor, tick, snap: () => actor.getSnapshot() };
  }

  it("advances through steps on the schedule's durations", () => {
    const { tick, snap } = start();
    expect(snap().context.index).toBe(0); // rinse (0 s long)
    tick(0);
    // step 0 lasts 0 s → immediately index 1 (bloom until 10 s)
    expect(snap().context.index).toBe(1);
    tick(10_000);
    expect(snap().context.index).toBe(2); // wait until 45 s
    tick(35_000);
    expect(snap().context.index).toBe(3); // pour 1 at 45 s
    expect(snap().context.steps[3].at).toBe(45);
  });

  it("pause keeps the remaining time; resume continues from it", () => {
    const { actor, tick, snap } = start();
    tick(0); // into bloom (10 s)
    tick(4_000);
    actor.send({ type: "PAUSE" });
    expect(snap().value).toBe("paused");
    expect(snap().context.spentInStepMs).toBe(4_000);
    tick(60_000); // a long pause
    expect(snap().context.index).toBe(1); // still bloom
    actor.send({ type: "RESUME" });
    tick(5_999);
    expect(snap().context.index).toBe(1);
    tick(1);
    expect(snap().context.index).toBe(2);
  });

  it("elapsed clock freezes while paused", () => {
    const { actor, tick, snap } = start();
    tick(0);
    tick(4_000);
    const t = snap().context;
    expect(elapsedMs(t, true, 4_000)).toBe(4_000);
    actor.send({ type: "PAUSE" });
    tick(10_000);
    expect(elapsedMs(snap().context, false, 14_000)).toBe(4_000);
  });

  it("SKIP jumps to the next step and finishes on the last", () => {
    const { actor, snap } = start();
    const n = schedule.steps.length;
    for (let i = 0; i < n; i++) actor.send({ type: "SKIP" });
    expect(snap().status).toBe("done");
  });

  it("finishes at totalSeconds when the clock advances step by step", () => {
    const { tick, snap } = start();
    // The simulated clock fires one timer per increment, so advance by each step's length.
    let total = 0;
    for (const step of schedule.steps) {
      tick(step.durationSeconds * 1000);
      total += step.durationSeconds;
    }
    expect(total).toBe(schedule.totalSeconds);
    expect(snap().status).toBe("done");
  });
});

describe("RESTORE (browser back/forward)", () => {
  it("replaces the selection and lands on the asked step", () => {
    const actor = createActor(wizardMachine, { input: {} }).start();
    actor.send({ type: "SELECT_METHOD", method: "aeropress" });
    actor.send({ type: "SELECT_RECIPE", recipeId: "aeropress-wendelboe" });
    actor.send({ type: "NEXT" });
    actor.send({ type: "NEXT" });
    expect(actor.getSnapshot().value).toBe("grinder");
    actor.send({
      type: "RESTORE",
      selection: { ...EMPTY_SELECTION, method: "v60" },
      step: "recipe",
    });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe("recipe");
    expect(snap.context.method).toBe("v60");
    expect(snap.context.recipeId).toBeUndefined();
  });
});
