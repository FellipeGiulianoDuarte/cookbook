"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { StepTitle } from "@/components/ui/choice";
import { Crossfade } from "@/components/ui/crossfade";
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

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label={t("dose")} value={dose} unit="g" accent index={0} />
        <Stat label={t("water")} value={water} unit="g" index={1} />
        <Stat label={t("ratio")} value={`1:${ratio.toFixed(1)}`} index={2} />
      </div>

      {derived.schedule?.bypass ? (
        <p className="mt-2 text-sm text-fg-muted">
          {t("bypass", { g: derived.schedule.bypass.grams })}
        </p>
      ) : null}
      {r.options?.iced ? (
        <p className="mt-1 text-sm text-fg-muted">
          {t("ice", { g: r.options.iced.iceGrams })}
        </p>
      ) : null}

      {!fixed ? (
        <div className="mt-8">
          <input
            type="range"
            min={r.dose.min}
            max={r.dose.max}
            step={0.5}
            value={dose}
            aria-label={t("dose")}
            onChange={(e) =>
              send({ type: "SET_DOSE", dose: Number(e.target.value) })
            }
            className="dose-slider w-full"
          />
          <div className="tabular mt-2 flex justify-between text-xs text-fg-faint">
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

function Stat({
  label,
  value,
  unit,
  accent,
  index,
}: {
  label: string;
  value: number | string;
  unit?: string;
  accent?: boolean;
  index: number;
}) {
  return (
    <div
      className="stagger-in rounded-2xl bg-surface p-4"
      style={{ "--i": index } as CSSProperties}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
        {label}
      </p>
      <p
        className={`tabular mt-1 font-display text-3xl leading-none tracking-tight ${accent ? "text-accent" : "text-fg"}`}
      >
        <Crossfade id={String(value)}>{value}</Crossfade>
        {unit ? (
          <span className="ml-1 text-base text-fg-faint">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
