"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
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
      <div className="mt-5 -mx-2 grid gap-1">
        {recipes.map((r, i) => (
          <ChoiceCard
            key={r.id}
            className="stagger-in"
            style={{ "--i": Math.min(i, 8) } as CSSProperties}
            selected={selection.recipeId === r.id}
            onSelect={() => send({ type: "SELECT_RECIPE", recipeId: r.id })}
            title={r.name}
            meta={formatClock(r.totalSeconds)}
            hint={
              <>
                <span className="block text-fg-faint">
                  {t("by", { author: r.author })}
                </span>
                <span className="tabular mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-coffee">
                    <b className="font-semibold">{r.dose.default}</b> g
                  </span>
                  <span className="text-water">
                    <b className="font-semibold">
                      {Math.round(r.dose.default * r.ratio)}
                    </b>{" "}
                    g
                  </span>
                  <span className="text-fg">
                    <b className="font-semibold">{r.temperature.default}</b> °C
                  </span>
                  <span className="text-fg-faint">{t(`style.${r.style}`)}</span>
                </span>
                <span className="mt-2 line-clamp-2 block">{L(r.summary)}</span>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
