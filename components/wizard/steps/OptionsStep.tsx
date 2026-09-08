"use client";

import { useTranslations } from "next-intl";
import { Chip, Eyebrow, StepTitle } from "@/components/ui/choice";
import { useLocalized } from "@/lib/use-localized";
import type { DerivedStepProps } from "./types";

export function OptionsStep({ selection, derived, send }: DerivedStepProps) {
  const t = useTranslations("options");
  const L = useLocalized();
  const r = derived.recipe;
  if (!r) return null;
  const orientation = selection.orientation ?? r.options?.orientation;

  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>

      {r.method === "aeropress" ? (
        <div className="mt-6">
          <Eyebrow>{t("orientation")}</Eyebrow>
          <div className="mt-2 flex gap-2">
            {(["upright", "inverted"] as const).map((o) => (
              <Chip
                key={o}
                selected={orientation === o}
                onSelect={() =>
                  send({ type: "SET_ORIENTATION", orientation: o })
                }
              >
                {t(o)}
              </Chip>
            ))}
          </div>
          {r.options?.orientation && orientation !== r.options.orientation ? (
            <p className="mt-2 text-xs text-fg-faint">
              {t("asWritten", { value: t(r.options.orientation) })}
            </p>
          ) : null}
        </div>
      ) : null}

      {r.options?.filter ? (
        <div className="mt-6">
          <Eyebrow>{t("filter")}</Eyebrow>
          <p className="mt-1 text-fg">{L(r.options.filter)}</p>
        </div>
      ) : null}
      {r.options?.model ? (
        <div className="mt-6">
          <Eyebrow>{t("model")}</Eyebrow>
          <p className="mt-1 text-fg">{L(r.options.model)}</p>
        </div>
      ) : null}
      {r.grind.note ? (
        <p className="mt-6 text-sm text-fg-muted">{L(r.grind.note)}</p>
      ) : null}
    </div>
  );
}
