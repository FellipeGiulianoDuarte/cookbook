"use client";

import { useTranslations } from "next-intl";
import { Chip, Eyebrow, StepTitle } from "@/components/ui/choice";
import { RoastLevel } from "@/lib/schema";
import { useLocalized } from "@/lib/use-localized";
import type { CatalogStepProps, DerivedStepProps } from "./types";

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
          <p className="mt-3 text-sm text-fg-muted">
            {L(catalog.adjustments.process[selection.process].description)}
          </p>
        ) : null}
      </div>

      {bean && derived.tempC !== undefined ? (
        <div className="mt-6 rounded-2xl bg-surface p-4">
          <p className="tabular font-display text-3xl tracking-tight text-fg">
            {t("temperature", { t: derived.tempC })}
          </p>
          <p className="mt-1 text-xs text-fg-faint">
            {t(`tempFrom.${bean.tempSource}`, {
              table: bean.tempTableId ?? "",
            })}
            {derived.recipe?.temperature.note
              ? ` · ${derived.recipe.temperature.note}`
              : ""}
          </p>
        </div>
      ) : null}

      {sug ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-sm font-semibold text-fg">{t("suggestion")}</p>
          <p className="tabular mt-1 text-sm text-fg-muted">
            {sug.tempDeltaC !== 0
              ? `${sug.tempDeltaC > 0 ? "+" : ""}${sug.tempDeltaC} °C`
              : null}
            {sug.grindPosDelta !== 0
              ? ` · grind ${sug.grindPosDelta > 0 ? "coarser" : "finer"}`
              : null}
            {sug.ratioDelta !== 0
              ? ` · ratio ${sug.ratioDelta > 0 ? "+" : ""}${sug.ratioDelta}`
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
            <span className="text-xs text-fg-faint">{t("communityNote")}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
