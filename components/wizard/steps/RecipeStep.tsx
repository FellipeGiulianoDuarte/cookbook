"use client";

import { useTranslations } from "next-intl";
import { ChoiceCard, StepTitle } from "@/components/ui/choice";
import { formatClock } from "@/lib/engine/schedule";
import { useLocalized } from "@/lib/use-localized";
import type { CatalogStepProps } from "./types";

export function RecipeStep({ catalog, selection, send }: CatalogStepProps) {
  const t = useTranslations("recipe");
  const L = useLocalized();
  const recipes = catalog.recipes.filter((r) => r.method === selection.method);
  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>
      <div className="mt-6 grid gap-3">
        {recipes.map((r) => (
          <ChoiceCard
            key={r.id}
            selected={selection.recipeId === r.id}
            onSelect={() => send({ type: "SELECT_RECIPE", recipeId: r.id })}
            title={
              <>
                {r.name}{" "}
                <span className="font-normal text-fg-muted">
                  {t("by", { author: r.author })}
                </span>
              </>
            }
            meta={`${t(`style.${r.style}`)} · ${t("total", { time: formatClock(r.totalSeconds) })}`}
            hint={
              <>
                {L(r.summary)}{" "}
                <span className="tabular text-fg-faint">
                  {t("dose", { min: r.dose.min, max: r.dose.max })} · 1:
                  {r.ratio.toFixed(1)}
                </span>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
