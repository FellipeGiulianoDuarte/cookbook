"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow, StepTitle } from "@/components/ui/choice";
import { fillStepText, formatClock } from "@/lib/engine/schedule";
import { useLocalized } from "@/lib/use-localized";
import type { DerivedStepProps } from "./types";

export function SummaryStep({ selection, derived }: DerivedStepProps) {
  const t = useTranslations();
  const L = useLocalized();
  const [copied, setCopied] = useState(false);
  const r = derived.recipe;
  const s = derived.schedule;
  if (!r || !s) return null;
  const setting = derived.setting;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <StepTitle>{t("summary.title")}</StepTitle>
      <p className="mt-2 text-fg-muted">
        {r.name} · {t("recipe.by", { author: r.author })}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cell label={t("amount.dose")} value={`${s.dose} g`} />
        <Cell
          label={t("amount.water")}
          value={`${s.water} g${s.bypass ? ` +${s.bypass.grams}` : ""}`}
        />
        <Cell label={t("summary.temp")} value={`${derived.tempC} °C`} />
        <Cell label={t("summary.time")} value={formatClock(s.totalSeconds)} />
      </div>

      <div className="mt-4 rounded-2xl bg-surface p-4">
        <Eyebrow>
          {t("summary.grind")} · {derived.grinder?.brand}{" "}
          {derived.grinder?.model}
        </Eyebrow>
        {setting?.kind === "ok" ? (
          <p className="mt-1">
            <span className="tabular font-display text-3xl tracking-tight text-accent">
              {setting.text}
            </span>
            <span className="tabular ml-2 text-fg-muted">
              {t("grinder.tolerance", { n: setting.tolerance })}
            </span>
            <span className="ml-2 text-sm text-fg-faint">
              {r.grind.texture}
              {selection.grindOffset
                ? ` · offset ${selection.grindOffset > 0 ? "+" : ""}${selection.grindOffset}`
                : ""}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-fg-muted">{r.grind.texture}</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-surface p-4">
        <Eyebrow>{t("summary.schedule")}</Eyebrow>
        <ol className="mt-2 space-y-2">
          {s.steps.map((st) => (
            <li
              key={`${st.at}-${st.action}-${st.cumulative}`}
              className="flex gap-3 text-sm"
            >
              <span className="tabular w-11 shrink-0 text-fg-faint">
                {formatClock(st.at)}
              </span>
              <span className="text-fg">
                {fillStepText(L(st.text), st, s.dose)}
                {st.water ? (
                  <b className="tabular ml-1 text-accent">{st.cumulative} g</b>
                ) : null}
                {st.note ? (
                  <span className="block text-xs text-fg-faint">
                    {L(st.note)}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 text-xs text-fg-faint">
        {t("summary.source")}:{" "}
        <a
          className="underline underline-offset-2"
          href={r.source.url}
          target="_blank"
          rel="noreferrer"
        >
          {r.source.title}
        </a>
        {r.source.notes ? ` · ${r.source.notes}` : ""}
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={share}>
          {copied ? t("nav.copied") : t("nav.share")}
        </Button>
        <Button className="flex-1" disabled title="Phase 3">
          {t("nav.start")}
        </Button>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
        {label}
      </p>
      <p className="tabular mt-1 font-display text-2xl leading-none tracking-tight text-fg">
        {value}
      </p>
    </div>
  );
}
