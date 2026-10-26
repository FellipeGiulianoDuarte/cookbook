"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Chip, Eyebrow, Quantity, StepTitle } from "@/components/ui/choice";
import { Crossfade } from "@/components/ui/crossfade";
import { RoastLevel } from "@/lib/schema";
import { useLocalized } from "@/lib/use-localized";
import type { CatalogStepProps, DerivedStepProps } from "./types";

/** Bean colour by roast, from a light cinnamon to a near-black French roast. */
const ROAST_SWATCH: Record<string, string> = {
  light: "#c49a6c",
  "medium-light": "#a5703f",
  medium: "#7d4f2c",
  "medium-dark": "#5a3720",
  dark: "#352116",
};

export function BeanStep({
  catalog,
  selection,
  derived,
  send,
}: CatalogStepProps & DerivedStepProps) {
  const t = useTranslations("bean");
  const L = useLocalized();
  const processes = Object.entries(catalog.adjustments.process);
  const bean = derived.bean;
  const sug = bean?.suggestions;

  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>

      <div className="mt-6">
        <Eyebrow>{t("roast")}</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          {RoastLevel.options.map((r) => (
            <Chip
              key={r}
              selected={selection.roast === r}
              onSelect={() => send({ type: "SET_BEAN", roast: r })}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full ring-1 ring-black/20"
                style={{ background: ROAST_SWATCH[r] }}
              />
              {t(`roasts.${r}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Eyebrow>{t("process")}</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          {processes.map(([id, p]) => (
            <Chip
              key={id}
              selected={selection.process === id}
              onSelect={() =>
                send({
                  type: "SET_BEAN",
                  process: id as keyof typeof catalog.adjustments.process,
                })
              }
            >
              {L(p.label)}
            </Chip>
          ))}
        </div>
        {selection.process ? (
          <Crossfade
            as="div"
            id={selection.process}
            className="mt-3 text-sm text-fg-muted"
          >
            {L(catalog.adjustments.process[selection.process].description)}
          </Crossfade>
        ) : null}
      </div>

      {bean && derived.tempC !== undefined ? (
        <div className="mt-8">
          <Crossfade id={derived.tempC}>
            <Quantity value={derived.tempC} unit="°C" size="lg" />
          </Crossfade>
          <p className="mt-2 text-sm text-fg-faint">
            {t("waterTemp")},{" "}
            {t(`tempFrom.${bean.tempSource}`, {
              table: bean.tempTableId ?? "",
            })}
            .
          </p>
          {derived.recipe?.temperature.note ? (
            <p className="mt-2 text-sm text-fg-muted">
              {L(derived.recipe.temperature.note)}
            </p>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {sug ? (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, transform: "translateY(6px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{
              opacity: 0,
              transform: "translateY(4px) scale(0.98)",
              transition: { duration: 0.12 },
            }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 rounded-[var(--radius)] bg-surface-2 p-4"
          >
            <p className="text-sm font-semibold text-fg">{t("suggestion")}</p>
            <p className="tabular mt-1 text-sm text-fg-muted">
              {sug.tempDeltaC !== 0
                ? `${sug.tempDeltaC > 0 ? "+" : ""}${sug.tempDeltaC} °C`
                : null}
              {sug.grindPosDelta !== 0
                ? `${sug.tempDeltaC !== 0 ? ", " : ""}${t(sug.grindPosDelta > 0 ? "grindCoarser" : "grindFiner")}`
                : null}
              {sug.ratioDelta !== 0
                ? `, ${t("ratio")} ${sug.ratioDelta > 0 ? "+" : ""}${sug.ratioDelta}`
                : null}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Chip
                selected={selection.nudge}
                onSelect={() =>
                  send({ type: "SET_NUDGE", nudge: !selection.nudge })
                }
              >
                {t("apply")}
              </Chip>
              <span className="text-sm text-fg-faint">
                {t("communityNote")}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
