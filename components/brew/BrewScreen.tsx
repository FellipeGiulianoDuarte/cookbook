"use client";

import { useActorRef, useSelector } from "@xstate/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SceneClient } from "@/components/scene/SceneClient";
import type { SceneState } from "@/components/scene/types";
import { Button } from "@/components/ui/button";
import { Quantity } from "@/components/ui/choice";
import { Crossfade } from "@/components/ui/crossfade";
import { SoundOffIcon, SoundOnIcon } from "@/components/ui/icons";
import { beep, unlockAudio } from "@/lib/audio";
import { brewMachine, elapsedMs } from "@/lib/brew-machine";
import {
  fillStepText,
  formatClock,
  type Schedule,
} from "@/lib/engine/schedule";
import { haptic } from "@/lib/haptics";
import type { Recipe } from "@/lib/schema";
import { useLocalized } from "@/lib/use-localized";
import { createWakeLock } from "@/lib/wakelock";

/*
  Kitchen mode. One big clock, the current instruction in large type, the next one small,
  a full-width Pause. The brew machine owns time; this component only renders it and
  fires the cues (beep, haptic, wake lock) from its entry actions.
*/

const MUTE_KEY = "cookbook:muted";

function BrewTimer({
  recipe,
  schedule,
  inverted,
  onExit,
  onDone,
}: {
  recipe: Recipe;
  schedule: Schedule;
  inverted: boolean;
  onExit: () => void;
  onDone: () => void;
}) {
  const t = useTranslations();
  const L = useLocalized();
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const machine = useMemo(
    () =>
      brewMachine.provide({
        actions: {
          onStepEnter: ({ context }) => {
            const step = context.steps[context.index];
            if (!step) return;
            if (context.index === 0) return; // the tap that started the brew is cue enough
            beep(
              step.action === "pour" || step.action === "bloom"
                ? "pour"
                : "step",
              mutedRef.current,
            );
            haptic("step");
          },
          onDone: () => {
            beep("done", mutedRef.current);
            haptic("done");
          },
        },
      }),
    [],
  );
  const actor = useActorRef(machine, { input: { schedule } });
  const snap = useSelector(actor, (s) => s);
  const running = snap.matches("running");
  const done = snap.status === "done";
  const ctx = snap.context;
  const step = ctx.steps[ctx.index];
  const nextStep = ctx.steps[ctx.index + 1];

  // Wake lock for the duration of the brew.
  useEffect(() => {
    const lock = createWakeLock();
    lock.acquire();
    return () => lock.release();
  }, []);

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  // Visible clock: sample the actor's context on every frame.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const elapsed = Math.min(
    elapsedMs(ctx, running, now) / 1000,
    schedule.totalSeconds,
  );
  const progress = elapsed / schedule.totalSeconds;
  const fill = step ? step.cumulative / schedule.water : 0;
  const pouring =
    running && !!step && (step.action === "pour" || step.action === "bloom");
  // plunger travel during a press step: fraction of the step already elapsed
  const inStep = step
    ? Math.min(
        1,
        Math.max(0, (elapsed - step.at) / Math.max(1, step.durationSeconds)),
      )
    : 0;
  const pressed = ctx.steps
    .slice(0, ctx.index)
    .some((s) => s.action === "press");
  const plunger = step?.action === "press" ? inStep : pressed || done ? 1 : 0;
  // an inverted brew stands on its plunger until the flip step; from there it is upright on the cup
  const flipped = ctx.steps
    .slice(0, ctx.index + 1)
    .some((s) => s.action === "flip");
  // Switch valve: the last position any step up to this one set; open once the brew is done.
  const lastValve = ctx.steps
    .slice(0, ctx.index + 1)
    .reverse()
    .find((s) => s.valve)?.valve;
  const valveOpen = done || lastValve !== "closed";
  const scene: SceneState = {
    method: recipe.method,
    focus: "brewing",
    valveOpen,
    fill,
    coffee: schedule.dose / Math.max(schedule.dose, recipe.dose.max),
    roast: 0.5,
    pouring,
    plunger,
    inverted: inverted && !flipped && !done,
    dialTicks: 12,
    dialValue: 0,
    idle: false,
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {}
  };

  return (
    <motion.div
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col"
      // Opacity only: a transform here would make the fixed control bar position
      // itself against this wrapper instead of the screen.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="stage relative h-[34svh] max-h-[320px] min-h-[220px] sm:mt-4 sm:overflow-hidden sm:rounded-t-[var(--radius-lg)]">
        <SceneClient state={scene} className="h-full" />
        <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="h-10 rounded-full bg-bg/75 px-4 text-sm text-fg backdrop-blur-md transition-[background-color] duration-150 hover:bg-bg/90"
          >
            ← {recipe.name}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? t("brew.soundOff") : t("brew.soundOn")}
            title={muted ? t("brew.soundOff") : t("brew.soundOn")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bg/75 text-fg backdrop-blur-md transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-bg/90 active:scale-90"
          >
            <Crossfade id={muted ? "off" : "on"}>
              {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            </Crossfade>
          </button>
        </div>
      </div>

      <main className="relative -mt-7 flex flex-1 flex-col rounded-t-[var(--radius-lg)] bg-surface px-5 pt-6 pb-36 shadow-[var(--shadow-sheet)] sm:px-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span role="timer" className="num block text-[6.5rem] text-water">
              {formatClock(elapsed)}
            </span>
            <span className="tabular mt-2 block text-sm text-fg-faint">
              {t("brew.of", { total: formatClock(schedule.totalSeconds) })}
            </span>
          </div>
          {step?.water ? (
            <div className="text-right">
              <Quantity
                value={step.cumulative}
                unit="g"
                kind="water"
                size="sm"
              />
              <span className="tabular mt-1 block text-sm text-fg-faint">
                {t("brew.ofWater", { total: schedule.water })}
              </span>
            </div>
          ) : null}
        </div>
        <div
          className="mt-5 h-1 overflow-hidden rounded-full bg-line-strong"
          aria-hidden="true"
        >
          <div
            className="h-full origin-left rounded-full bg-water"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, progress))})`,
            }}
          />
        </div>

        {done ? (
          <section className="mt-8">
            <p className="display text-[2.5rem] leading-none text-fg">
              {t("brew.doneTitle")}
            </p>
            <p className="mt-1 text-fg-muted">
              {L(recipe.steps[recipe.steps.length - 1].text)}
            </p>
          </section>
        ) : step ? (
          <section className="mt-8" aria-live="polite">
            <Crossfade id={ctx.index} className="block">
              <p className="tabular text-sm text-water">
                {step.until
                  ? t("brew.window", {
                      from: formatClock(step.at),
                      to: formatClock(step.until),
                    })
                  : formatClock(step.at)}
              </p>
              <p className="mt-2 text-[1.75rem] font-semibold leading-[1.18] tracking-[-0.015em] text-fg">
                {fillStepText(L(step.text), step, schedule.dose)}
              </p>
              {step.note ? (
                <p className="mt-2 text-sm text-fg-muted">{L(step.note)}</p>
              ) : null}
              {nextStep ? (
                <p className="mt-6 border-t border-line pt-4 text-fg-muted">
                  <span className="text-fg-faint">{t("brew.next")} </span>
                  <span className="tabular text-water">
                    {formatClock(nextStep.at)}
                  </span>{" "}
                  {fillStepText(L(nextStep.text), nextStep, schedule.dose)}
                </p>
              ) : null}
            </Crossfade>
          </section>
        ) : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 bg-surface/90 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-7">
        <div className="mx-auto flex max-w-xl gap-3">
          {done ? (
            <>
              <span className="min-w-24" aria-hidden="true" />
              <Button className="flex-1" size="xl" onClick={onExit}>
                {t("nav.again")}
              </Button>
            </>
          ) : running ? (
            <>
              <Button
                variant="ghost"
                size="xl"
                onClick={() => actor.send({ type: "SKIP" })}
                className="min-w-24"
              >
                {t("nav.skip")}
              </Button>
              <Button
                className="flex-1"
                size="xl"
                variant="secondary"
                onClick={() => actor.send({ type: "PAUSE" })}
              >
                {t("nav.pause")}
              </Button>
            </>
          ) : (
            <Button
              className="flex-1"
              size="xl"
              onClick={() => actor.send({ type: "RESUME" })}
            >
              {t("nav.resume")}
            </Button>
          )}
        </div>
      </nav>
    </motion.div>
  );
}

/** Call inside the tap handler that starts the brew: unlocks audio on iOS. */
export function primeBrewAudio() {
  unlockAudio();
}

/*
  Before the clock: the recipe's untimed setup steps (rinse the filter, add the coffee)
  as a checklist. The timer starts on the second tap, from the first timed step.
*/
export function BrewScreen({
  recipe,
  schedule,
  inverted,
  onExit,
  onDone,
}: {
  recipe: Recipe;
  schedule: Schedule;
  inverted: boolean;
  onExit: () => void;
  onDone: () => void;
}) {
  const t = useTranslations();
  const L = useLocalized();
  const prepCount = schedule.steps.findIndex((s) => s.durationSeconds > 0);
  const prep = prepCount <= 0 ? [] : schedule.steps.slice(0, prepCount);
  const [started, setStarted] = useState(prep.length === 0);

  if (started) {
    const timed = prep.length
      ? { ...schedule, steps: schedule.steps.slice(prep.length) }
      : schedule;
    return (
      <BrewTimer
        recipe={recipe}
        schedule={timed}
        inverted={inverted}
        onExit={onExit}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <div className="stage relative h-[34svh] max-h-[320px] min-h-[220px] sm:mt-4 sm:overflow-hidden sm:rounded-t-[var(--radius-lg)]">
        <SceneClient
          state={{
            method: recipe.method,
            focus: "brewer",
            fill: 0,
            coffee: schedule.dose / Math.max(schedule.dose, recipe.dose.max),
            roast: 0.5,
            pouring: false,
            plunger: 0,
            valveOpen: true,
            inverted,
            dialTicks: 12,
            dialValue: 0,
            idle: true,
          }}
          className="h-full"
        />
        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3">
          <button
            type="button"
            onClick={onExit}
            className="h-10 rounded-full bg-bg/75 px-4 text-sm text-fg backdrop-blur-md hover:bg-bg/90"
          >
            ← {recipe.name}
          </button>
        </div>
      </div>
      <main className="relative -mt-7 flex flex-1 flex-col rounded-t-[var(--radius-lg)] bg-surface px-5 pt-7 pb-36 shadow-[var(--shadow-sheet)] sm:px-7">
        <p className="tabular flex flex-wrap gap-x-4 text-fg-muted">
          <span className="text-coffee">{schedule.dose} g</span>
          <span className="text-water">{schedule.water} g</span>
          <span className="text-water">
            {formatClock(schedule.totalSeconds)}
          </span>
        </p>
        <h1 className="display mt-3 text-[2.125rem] leading-[1.02] text-fg">
          {t("brew.ready")}
        </h1>
        <p className="mt-2 text-fg-muted">{t("brew.prepHint")}</p>
        <ol className="mt-5">
          {prep.map((s, i) => (
            <li
              key={`${s.action}-${s.cumulative}`}
              className="stagger-in flex gap-4 border-t border-line py-4 text-fg first:border-t-0"
              style={{ "--i": Math.min(i, 8) } as CSSProperties}
            >
              <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm text-fg-muted">
                {i + 1}
              </span>
              <span className="leading-snug">
                {fillStepText(L(s.text), s, schedule.dose)}
              </span>
            </li>
          ))}
        </ol>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 bg-surface/90 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-7">
        <div className="mx-auto flex max-w-xl">
          <Button
            className="flex-1"
            size="xl"
            onClick={() => {
              primeBrewAudio();
              setStarted(true);
            }}
          >
            {t("brew.startTimer")}
          </Button>
        </div>
      </nav>
    </div>
  );
}
