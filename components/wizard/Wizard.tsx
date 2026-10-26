"use client";

import { useActorRef, useSelector } from "@xstate/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef } from "react";
import { BrewScreen } from "@/components/brew/BrewScreen";
import { SceneClient } from "@/components/scene/SceneClient";
import type { SceneState } from "@/components/scene/types";
import { Button } from "@/components/ui/button";
import { Crossfade } from "@/components/ui/crossfade";
import { cn } from "@/lib/cn";
import { type ClientCatalog, derive } from "@/lib/derive";
import {
  canLeave,
  firstIncompleteStep,
  WIZARD_STEPS,
  type WizardState,
  type WizardStep,
  wizardMachine,
} from "@/lib/machine";
import { readMyGrinder } from "@/lib/my-grinder";
import { type UrlState, urlParsers } from "@/lib/url";
import {
  sanitizeSelection,
  selectionFromUrl,
  urlFromSelection,
} from "@/lib/url-selection";
import { LanguageToggle } from "./LanguageToggle";
import { AmountStep } from "./steps/AmountStep";
import { BeanStep } from "./steps/BeanStep";
import { GrinderStep } from "./steps/GrinderStep";
import { MethodStep } from "./steps/MethodStep";
import { OptionsStep } from "./steps/OptionsStep";
import { RecipeStep } from "./steps/RecipeStep";
import { SummaryStep } from "./steps/SummaryStep";

const ROAST_INDEX = {
  light: 0,
  "medium-light": 0.25,
  medium: 0.5,
  "medium-dark": 0.75,
  dark: 1,
} as const;

/*
  The wizard shell. One XState actor owns the selection; nuqs mirrors it into the URL so a
  recipe is a shareable link. Steps are plain components that read the derived data and
  send events. The 3D slot shows the static Fallback until Phase 4.
*/

export function Wizard({
  catalog,
  initial,
}: {
  catalog: ClientCatalog;
  initial: UrlState;
}) {
  const t = useTranslations();
  const reduce = useReducedMotion();
  const [, setUrl] = useQueryStates(urlParsers, {
    history: "replace",
    shallow: true,
  });

  const initialSelection = useMemo(
    () => sanitizeSelection(selectionFromUrl(initial), catalog),
    [catalog, initial],
  );

  // The step a link lands on: the one it asks for, never past the first unanswered step.
  // A dose outside the recipe's range (old link) sends the user back to the dose step.
  const initialStep = useMemo<WizardStep>(() => {
    const first = derive(catalog, initialSelection).doseError
      ? "amount"
      : firstIncompleteStep(initialSelection);
    const wanted = initial.step ?? first;
    return WIZARD_STEPS.indexOf(wanted) <= WIZARD_STEPS.indexOf(first)
      ? wanted
      : first;
  }, [catalog, initialSelection, initial.step]);

  const actor = useActorRef(wizardMachine, {
    input: { selection: initialSelection },
  });
  const state = useSelector(actor, (s) => s.value as WizardState);
  const brewing = state === "brewing" || state === "done";
  const step: WizardStep = brewing ? "summary" : state;
  const selection = useSelector(actor, (s) => s.context);
  const derived = useMemo(
    () => derive(catalog, selection),
    [catalog, selection],
  );

  // Restore the step from the URL once.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (initialStep !== "method")
      actor.send({ type: "JUMP", step: initialStep });
  }, [actor, initialStep]);

  // A grinder starred on this device is picked for you when the link names none.
  useEffect(() => {
    if (initialSelection.grinderId) return;
    const mine = readMyGrinder();
    if (mine && catalog.grinders.some((g) => g.id === mine))
      actor.send({ type: "SELECT_GRINDER", grinderId: mine });
  }, [actor, catalog, initialSelection.grinderId]);

  // Entering the dose step with no dose yet: start from the recipe's default.
  useEffect(() => {
    if (step === "amount" && selection.dose === undefined && derived.recipe) {
      actor.send({ type: "SET_DOSE", dose: derived.recipe.dose.default });
    }
  }, [step, selection.dose, derived.recipe, actor]);

  // Mirror selection and step into the URL. A step change is a history entry so the
  // browser's back button walks the wizard backwards; edits within a step replace.
  const lastStep = useRef(step);
  const settled = useRef(false);
  useEffect(() => {
    // Landing on a link's step replaces the entry the link opened; later step changes push.
    const push =
      settled.current && lastStep.current !== step && !fromHistory.current;
    if (step === initialStep) settled.current = true;
    fromHistory.current = false;
    lastStep.current = step;
    setUrl(
      { ...urlFromSelection(selection), step: step === "method" ? null : step },
      { history: push ? "push" : "replace" },
    );
  }, [selection, step, setUrl, initialStep]);

  // Browser back/forward: the URL is the truth, so read it, replace the selection and land
  // on its step. Only popstate triggers this; our own pushState/replaceState never does,
  // so the state → URL mirror above cannot feed back into it.
  const latest = useRef({ selection, step, brewing });
  latest.current = { selection, step, brewing };
  const fromHistory = useRef(false);
  useEffect(() => {
    const onPop = () => {
      if (latest.current.brewing) return;
      const sp = new URLSearchParams(window.location.search);
      const parsed = Object.fromEntries(
        Object.entries(urlParsers).map(([key, parser]) => {
          const raw = sp.get(key);
          const p = parser as {
            parse: (v: string) => unknown;
            defaultValue?: unknown;
          };
          const value = raw === null ? null : p.parse(raw);
          return [key, value ?? p.defaultValue ?? null];
        }),
      ) as UrlState;
      const wanted = sanitizeSelection(selectionFromUrl(parsed), catalog);
      const first = derive(catalog, wanted).doseError
        ? "amount"
        : firstIncompleteStep(wanted);
      const asked = parsed.step ?? "method";
      const target =
        WIZARD_STEPS.indexOf(asked) <= WIZARD_STEPS.indexOf(first)
          ? asked
          : first;
      fromHistory.current = true;
      actor.send({ type: "RESTORE", selection: wanted, step: target });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [actor, catalog]);

  const index = WIZARD_STEPS.indexOf(step);
  const canNext = canLeave(step, selection) && !derived.doseError;
  const dir = useRef(1);
  const go = (type: "NEXT" | "BACK") => {
    dir.current = type === "NEXT" ? 1 : -1;
    actor.send({ type });
  };

  const inverted =
    (selection.orientation ?? derived.recipe?.options?.orientation) ===
    "inverted";
  const scene: SceneState = {
    method: selection.method,
    focus:
      step === "method"
        ? "brewers"
        : step === "grinder"
          ? "grinder"
          : step === "bean"
            ? "bean"
            : "brewer",
    fill: 0,
    coffee:
      derived.recipe &&
      WIZARD_STEPS.indexOf(step) >= WIZARD_STEPS.indexOf("amount")
        ? derived.dose / derived.recipe.dose.max
        : 0,
    roast: ROAST_INDEX[selection.roast],
    pouring: false,
    plunger: 0,
    inverted,
    valveOpen: true,
    dialTicks: derived.grinder?.clicksPerRotation ?? 12,
    dialValue: derived.setting?.kind === "ok" ? derived.setting.value : 0,
    idle: true,
  };

  if (brewing && derived.recipe && derived.schedule) {
    return (
      <BrewScreen
        key={`${derived.recipe.id}-${derived.schedule.dose}`}
        recipe={derived.recipe}
        schedule={derived.schedule}
        inverted={inverted}
        onExit={() => actor.send({ type: "EXIT" })}
        onDone={() => actor.send({ type: "DONE" })}
      />
    );
  }

  const body = (() => {
    switch (step) {
      case "method":
        return <MethodStep selection={selection} send={actor.send} />;
      case "recipe":
        return (
          <RecipeStep
            catalog={catalog}
            selection={selection}
            send={actor.send}
          />
        );
      case "grinder":
        return (
          <GrinderStep
            catalog={catalog}
            selection={selection}
            derived={derived}
            send={actor.send}
          />
        );
      case "amount":
        return (
          <AmountStep
            selection={selection}
            derived={derived}
            send={actor.send}
          />
        );
      case "bean":
        return (
          <BeanStep
            catalog={catalog}
            selection={selection}
            derived={derived}
            send={actor.send}
          />
        );
      case "options":
        return (
          <OptionsStep
            selection={selection}
            derived={derived}
            send={actor.send}
          />
        );
      case "summary":
        return (
          <SummaryStep
            catalog={catalog}
            selection={selection}
            derived={derived}
            send={actor.send}
          />
        );
    }
  })();

  const reachable = (i: number) =>
    i <= index ||
    (WIZARD_STEPS.slice(0, i).every((p) => canLeave(p, selection)) &&
      !(derived.doseError !== undefined && i > WIZARD_STEPS.indexOf("amount")));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      {/* The stage: the equipment for this step, full width, under the sheet's edge. */}
      <div className="stage relative h-[40svh] max-h-[380px] min-h-[250px] sm:mt-4 sm:rounded-t-[var(--radius-lg)] sm:overflow-hidden">
        <SceneClient state={scene} className="h-full" />
        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-4">
          <LanguageToggle />
        </div>
      </div>

      <main className="relative -mt-7 flex flex-1 flex-col rounded-t-[var(--radius-lg)] bg-surface px-5 pt-4 pb-32 shadow-[var(--shadow-sheet)] sm:px-7">
        <Ruler
          steps={WIZARD_STEPS}
          index={index}
          reachable={reachable}
          label={(s) => t(`steps.${s}`)}
          navLabel={t("steps.progress", {
            current: index + 1,
            total: WIZARD_STEPS.length,
          })}
          onJump={(s) => {
            dir.current = WIZARD_STEPS.indexOf(s) > index ? 1 : -1;
            actor.send({ type: "JUMP", step: s });
          }}
        />

        <div className="relative mt-6 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={step}
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      transform: `translateX(${18 * dir.current}px)`,
                    }
              }
              animate={{ opacity: 1, transform: "translateX(0px)" }}
              exit={
                reduce
                  ? undefined
                  : {
                      opacity: 0,
                      transform: `translateX(${-14 * dir.current}px)`,
                      transition: { duration: 0.12 },
                    }
              }
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              aria-labelledby="step-title"
            >
              {body}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 bg-surface/90 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-7">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {index > 0 ? (
            <Button
              variant="ghost"
              onClick={() => go("BACK")}
              className="min-w-24"
            >
              {t("nav.back")}
            </Button>
          ) : null}
          {step !== "summary" ? (
            <Button
              onClick={() => go("NEXT")}
              disabled={!canNext}
              className="flex-1"
            >
              {index + 1 < WIZARD_STEPS.length ? (
                <Crossfade id={WIZARD_STEPS[index + 1]}>
                  {t("nav.nextTo", {
                    step: t(`steps.${WIZARD_STEPS[index + 1]}`),
                  })}
                </Crossfade>
              ) : (
                t("nav.next")
              )}
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

/**
 * Progress as the scale printed on a glass server: one long mark per step, short marks
 * between. Marks up to the current step are amber, the current one is milk white and
 * taller. Each long mark is a button that jumps back, or forward when the steps before it
 * are answered.
 */
function Ruler({
  steps,
  index,
  reachable,
  label,
  navLabel,
  onJump,
}: {
  steps: readonly WizardStep[];
  index: number;
  reachable: (i: number) => boolean;
  label: (s: WizardStep) => string;
  navLabel: string;
  onJump: (s: WizardStep) => void;
}) {
  return (
    <nav aria-label={navLabel} className="flex items-end pr-1">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const done = i < index;
        const current = i === index;
        return (
          <button
            key={s}
            type="button"
            aria-label={label(s)}
            aria-current={current ? "step" : undefined}
            disabled={!reachable(i)}
            onClick={() => onJump(s)}
            className={cn(
              "group flex h-9 items-end gap-[calc((100%-3px)/5)] disabled:cursor-default",
              last ? "flex-none" : "flex-1",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block w-[3px] rounded-full transition-[height,background-color] duration-300 ease-[var(--ease-out)]",
                current
                  ? "h-6 bg-fg"
                  : done
                    ? "h-4 bg-coffee"
                    : "h-4 bg-line-strong group-enabled:group-hover:bg-fg-faint",
              )}
            />
            {last
              ? null
              : [0, 1, 2, 3].map((k) => (
                  <span
                    key={k}
                    aria-hidden="true"
                    className={cn(
                      "block h-2 w-px transition-[background-color] duration-300",
                      done ? "bg-coffee/70" : "bg-line-strong",
                    )}
                  />
                ))}
          </button>
        );
      })}
    </nav>
  );
}
