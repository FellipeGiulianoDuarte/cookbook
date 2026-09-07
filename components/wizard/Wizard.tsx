"use client";

import { useActorRef, useSelector } from "@xstate/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef } from "react";
import { BrewScreen } from "@/components/brew/BrewScreen";
import { Fallback } from "@/components/scene/Fallback";
import { Button } from "@/components/ui/button";
import { type ClientCatalog, derive } from "@/lib/derive";
import {
  canLeave,
  firstIncompleteStep,
  WIZARD_STEPS,
  type WizardState,
  type WizardStep,
  wizardMachine,
} from "@/lib/machine";
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

  // Entering the dose step with no dose yet: start from the recipe's default.
  useEffect(() => {
    if (step === "amount" && selection.dose === undefined && derived.recipe) {
      actor.send({ type: "SET_DOSE", dose: derived.recipe.dose.default });
    }
  }, [step, selection.dose, derived.recipe, actor]);

  // Mirror selection and step into the URL.
  useEffect(() => {
    setUrl({
      ...urlFromSelection(selection),
      step: step === "method" ? null : step,
    });
  }, [selection, step, setUrl]);

  const index = WIZARD_STEPS.indexOf(step);
  const canNext = canLeave(step, selection) && !derived.doseError;
  const dir = useRef(1);
  const go = (type: "NEXT" | "BACK") => {
    dir.current = type === "NEXT" ? 1 : -1;
    actor.send({ type });
  };

  if (brewing && derived.recipe && derived.schedule) {
    return (
      <BrewScreen
        key={`${derived.recipe.id}-${derived.schedule.dose}`}
        recipe={derived.recipe}
        schedule={derived.schedule}
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
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 disabled:cursor-default ${
                i < index
                  ? "bg-accent/70"
                  : i === index
                    ? "bg-accent"
                    : "bg-line-strong"
              }`}
            />
          ))}
        </nav>
        <LanguageToggle />
      </header>

      <div className="mt-5 h-44 rounded-2xl bg-surface p-3 sm:h-52">
        <Fallback
          method={selection.method}
          fill={step === "amount" || step === "summary" ? 0.6 : 0.15}
          className="h-full"
        />
      </div>

      <div className="relative mt-6 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            initial={reduce ? false : { opacity: 0, x: 24 * dir.current }}
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduce
                ? undefined
                : {
                    opacity: 0,
                    x: -24 * dir.current,
                    transition: { duration: 0.15 },
                  }
            }
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
                <span className="font-normal text-accent-ink/70">
                  · {t(`steps.${WIZARD_STEPS[index + 1]}`)}
                </span>
              ) : null}
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
