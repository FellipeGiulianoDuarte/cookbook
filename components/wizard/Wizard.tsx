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
import { selectionFromUrl, urlFromSelection } from "@/lib/url-selection";
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

  const initialSelection = useMemo(() => {
    const s = selectionFromUrl(initial);
    // Drop ids the catalog does not know (old links, typos) so the wizard never dead-ends.
    if (s.recipeId && !catalog.recipes.some((r) => r.id === s.recipeId))
      s.recipeId = undefined;
    if (s.grinderId && !catalog.grinders.some((g) => g.id === s.grinderId))
      s.grinderId = undefined;
    return s;
  }, [catalog, initial]);

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

  // Restore the step from the URL once, or land on the first incomplete step.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    // Never restore a step the selection cannot support (old link, dropped id).
    // A dose outside the recipe's range (old link) sends the user back to the dose step.
    const first = derive(catalog, initialSelection).doseError
      ? "amount"
      : firstIncompleteStep(initialSelection);
    const wanted = initial.step ?? first;
    const target =
      WIZARD_STEPS.indexOf(wanted) <= WIZARD_STEPS.indexOf(first)
        ? wanted
        : first;
    if (target !== "method") actor.send({ type: "JUMP", step: target });
  }, [actor, initial.step, initialSelection, catalog]);

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
  useEffect(() => {
    const push =
      lastStep.current !== step && restored.current && !fromHistory.current;
    fromHistory.current = false;
    lastStep.current = step;
    setUrl(
      { ...urlFromSelection(selection), step: step === "method" ? null : step },
      { history: push ? "push" : "replace" },
    );
  }, [selection, step, setUrl]);

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
      const wanted = selectionFromUrl(parsed);
      if (
        wanted.recipeId &&
        !catalog.recipes.some((r) => r.id === wanted.recipeId)
      )
        wanted.recipeId = undefined;
      if (
        wanted.grinderId &&
        !catalog.grinders.some((g) => g.id === wanted.grinderId)
      )
        wanted.grinderId = undefined;
      const first = firstIncompleteStep(wanted);
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-28 pt-4 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <nav
          className="flex flex-1 items-center gap-1.5"
          aria-label={t("steps.progress", {
            current: index + 1,
            total: WIZARD_STEPS.length,
          })}
        >
          {WIZARD_STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-label={t(`steps.${s}`)}
              aria-current={i === index ? "step" : undefined}
              disabled={
                i > index &&
                !WIZARD_STEPS.slice(0, i).every((p) => canLeave(p, selection))
              }
              onClick={() => actor.send({ type: "JUMP", step: s })}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-strong disabled:cursor-default"
            >
              <span
                className="block h-full w-full origin-left rounded-full bg-accent transition-[transform,opacity] duration-[420ms] ease-[var(--ease-out)]"
                style={{
                  transform: `scaleX(${i <= index ? 1 : 0})`,
                  opacity: i < index ? 0.7 : 1,
                }}
              />
            </button>
          ))}
        </nav>
        <LanguageToggle />
      </header>

      <div className="stage mt-5 h-64 overflow-hidden rounded-2xl sm:h-72">
        <SceneClient state={scene} className="h-full" />
      </div>

      <div className="relative mt-6 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            initial={
              reduce
                ? false
                : { opacity: 0, transform: `translateX(${20 * dir.current}px)` }
            }
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            exit={
              reduce
                ? undefined
                : {
                    opacity: 0,
                    transform: `translateX(${-16 * dir.current}px)`,
                    transition: { duration: 0.12 },
                  }
            }
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            aria-labelledby="step-title"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
              {t("steps.progress", {
                current: index + 1,
                total: WIZARD_STEPS.length,
              })}{" "}
              · {t(`steps.${step}`)}
            </p>
            {body}
          </motion.section>
        </AnimatePresence>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/85 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-xl gap-3">
          {index > 0 ? (
            <Button
              variant="secondary"
              onClick={() => go("BACK")}
              className="min-w-28"
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
              {t("nav.next")}
              {index + 1 < WIZARD_STEPS.length ? (
                <Crossfade
                  id={WIZARD_STEPS[index + 1]}
                  className="font-normal text-accent-ink/70"
                >
                  · {t(`steps.${WIZARD_STEPS[index + 1]}`)}
                </Crossfade>
              ) : null}
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
