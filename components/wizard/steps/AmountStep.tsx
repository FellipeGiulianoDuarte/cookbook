"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Quantity, StepTitle } from "@/components/ui/choice";
import { Crossfade } from "@/components/ui/crossfade";
import { haptic } from "@/lib/haptics";
import type { DerivedStepProps } from "./types";

export function AmountStep({ selection, derived, send }: DerivedStepProps) {
  const t = useTranslations("amount");
  const r = derived.recipe;
  if (!r) return null;
  const fixed = r.scaling === "fixed";
  const dose = derived.dose;
  const water =
    derived.schedule?.water ?? Math.round(dose * (derived.ratio ?? r.ratio));
  const ratio = derived.ratio ?? r.ratio;

  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>

      <div className="mt-7 flex items-end gap-5">
        <Measure label={t("dose")}>
          <Crossfade id={String(dose)}>
            <Quantity value={dose} unit="g" kind="coffee" size="lg" />
          </Crossfade>
        </Measure>
        <span aria-hidden="true" className="mb-9 text-2xl text-fg-faint">
          →
        </span>
        <Measure label={t("water")}>
          <Crossfade id={String(water)}>
            <Quantity value={water} unit="g" kind="water" size="lg" />
          </Crossfade>
        </Measure>
      </div>
      <p className="tabular mt-3 text-fg-muted">
        {t("ratioLine", { ratio: ratio.toFixed(1) })}
      </p>

      {derived.schedule?.bypass ? (
        <p className="mt-1 text-sm text-fg-muted">
          {t("bypass", { g: derived.schedule.bypass.grams })}
        </p>
      ) : null}
      {r.options?.iced ? (
        <p className="mt-1 text-sm text-fg-muted">
          {t("ice", { g: r.options.iced.iceGrams })}
        </p>
      ) : null}

      {!fixed ? (
        <div className="mt-9">
          <input
            type="range"
            min={r.dose.min}
            max={r.dose.max}
            step={0.5}
            value={dose}
            aria-label={t("dose")}
            onChange={(e) => {
              const dose = Number(e.target.value);
              // one light tap per whole gram, throttled inside haptic()
              if (Math.round(dose) !== Math.round(selection.dose ?? dose))
                haptic("select");
              send({ type: "SET_DOSE", dose });
            }}
            className="dose-slider w-full"
            style={
              {
                "--filled": `${((dose - r.dose.min) / Math.max(1, r.dose.max - r.dose.min)) * 100}%`,
              } as CSSProperties
            }
          />
          <div className="tabular mt-3 flex justify-between text-sm text-fg-faint">
            <span>{r.dose.min} g</span>
            <span>{r.dose.max} g</span>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-fg-muted">
          {t("outOfRange", { min: r.dose.min, max: r.dose.max })}
        </p>
      )}

      {derived.doseError ? (
        <p className="mt-3 text-sm text-warn">
          {t("outOfRange", {
            min: derived.doseError.min,
            max: derived.doseError.max,
          })}
        </p>
      ) : null}

      {selection.dose === undefined ? (
        <button
          type="button"
          className="mt-4 text-sm text-accent underline-offset-4 hover:underline"
          onClick={() => send({ type: "SET_DOSE", dose: r.dose.default })}
        >
          {r.dose.default} g
        </button>
      ) : null}
    </div>
  );
}

function Measure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="stagger-in">
      {children}
      <p className="mt-2 text-sm text-fg-faint">{label}</p>
    </div>
  );
}
