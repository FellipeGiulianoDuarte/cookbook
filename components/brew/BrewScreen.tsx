"use client";

import { useActorRef, useSelector } from "@xstate/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fallback } from "@/components/scene/Fallback";
import { Button } from "@/components/ui/button";
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
  onExit,
  onDone,
}: {
  recipe: Recipe;
  schedule: Schedule;
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
            haptic(step.action === "pour" ? [40, 60, 40] : 40);
          },
          onDone: () => {
            beep("done", mutedRef.current);
            haptic([60, 80, 60, 80, 60]);
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

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {}
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-32 pt-4 sm:px-6">
      <header className="flex items-center justify-between text-xs text-fg-faint">
        <button
          type="button"
          onClick={onExit}
          className="h-10 rounded-full px-3 text-fg-muted hover:bg-surface-2"
        >
          ← {recipe.name}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="h-10 rounded-full px-3 text-fg-muted hover:bg-surface-2"
        >
          {muted ? t("brew.soundOff") : t("brew.soundOn")}
        </button>
      </header>

      <div className="relative mt-3 h-40 rounded-2xl bg-surface p-3 sm:h-48">
        <Fallback method={recipe.method} fill={fill} className="h-full" />
        {step?.water ? (
          <span className="tabular absolute right-4 top-3 text-xs text-fg-faint">
            {step.cumulative} g / {schedule.water} g
          </span>
        ) : null}
      </div>

      <div className="mt-6 text-center">
        <ProgressRing progress={progress}>
          <span className="tabular font-display text-[4.25rem] leading-none tracking-tight text-fg">
            {formatClock(elapsed)}
          </span>
        </ProgressRing>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
          {formatClock(schedule.totalSeconds)} ·{" "}
          {recipe.method === "v60" ? "V60" : "AeroPress"}
        </p>
      </div>

      {done ? (
        <section className="mt-8 rounded-2xl bg-surface p-5 text-center">
          <p className="font-display text-3xl text-fg">{t("brew.doneTitle")}</p>
          <p className="mt-1 text-fg-muted">
            {L(recipe.steps[recipe.steps.length - 1].text)}
          </p>
        </section>
      ) : step ? (
        <section className="mt-8 rounded-2xl bg-surface p-5" aria-live="polite">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
            {formatClock(step.at)}
            {step.until ? ` → ${formatClock(step.until)}` : ""}
          </p>
          <p className="mt-1 font-display text-2xl leading-tight text-fg sm:text-3xl">
            {fillStepText(L(step.text), step, schedule.dose)}
          </p>
          {step.note ? (
            <p className="mt-2 text-sm text-fg-muted">{L(step.note)}</p>
          ) : null}
          {nextStep ? (
            <p className="mt-4 border-t border-line pt-3 text-sm text-fg-muted">
              <span className="text-fg-faint">{t("brew.next")} · </span>
              <span className="tabular">{formatClock(nextStep.at)}</span>{" "}
              {fillStepText(L(nextStep.text), nextStep, schedule.dose)}
            </p>
          ) : null}
        </section>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
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
    </div>
  );
}

function ProgressRing({
  progress,
  children,
}: {
  progress: number;
  children: React.ReactNode;
}) {
  const r = 118;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-64 w-64">
      <svg
        viewBox="0 0 256 256"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="128"
          cy="128"
          r={r}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="6"
        />
        <circle
          cx="128"
          cy="128"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
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
  onExit,
  onDone,
}: {
  recipe: Recipe;
  schedule: Schedule;
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
        onExit={onExit}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-32 pt-4 sm:px-6">
      <header className="flex items-center justify-between text-xs text-fg-faint">
        <button
          type="button"
          onClick={onExit}
          className="h-10 rounded-full px-3 text-fg-muted hover:bg-surface-2"
        >
          ← {recipe.name}
        </button>
      </header>
      <div className="mt-3 h-40 rounded-2xl bg-surface p-3 sm:h-48">
        <Fallback method={recipe.method} fill={0} className="h-full" />
      </div>
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
        {schedule.dose} g · {schedule.water} g ·{" "}
        {formatClock(schedule.totalSeconds)}
      </p>
      <h1 className="mt-1 font-display text-[2rem] leading-[1.05] tracking-tight text-fg">
        {t("brew.ready")}
      </h1>
      <p className="mt-2 text-fg-muted">{t("brew.prepHint")}</p>
      <ol className="mt-5 space-y-3">
        {prep.map((s, i) => (
          <li
            key={`${s.action}-${s.cumulative}`}
            className="flex gap-3 rounded-2xl bg-surface p-4 text-fg"
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
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
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
