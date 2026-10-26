"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useState } from "react";
import { primeBrewAudio } from "@/components/brew/BrewScreen";
import { ControlChart } from "@/components/chart/ControlChart";
import { Button } from "@/components/ui/button";
import { Quantity, StepTitle } from "@/components/ui/choice";
import { Crossfade } from "@/components/ui/crossfade";
import { fillStepText, formatClock } from "@/lib/engine/schedule";
import { useLocalized } from "@/lib/use-localized";
import { useSettingText } from "@/lib/use-setting-text";
import type { CatalogStepProps, DerivedStepProps } from "./types";

export function SummaryStep({
  catalog,
  selection,
  derived,
  send,
}: CatalogStepProps & DerivedStepProps) {
  const t = useTranslations();
  const L = useLocalized();
  const [copied, setCopied] = useState(false);
  const settingText = useSettingText();
  const r = derived.recipe;
  const s = derived.schedule;
  if (!r || !s)
    return (
      <div>
        <StepTitle>{t("summary.title")}</StepTitle>
        <p className="mt-3 text-fg-muted">
          {r ? t("summary.needDose") : t("summary.needRecipe")}
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => send({ type: "JUMP", step: r ? "amount" : "recipe" })}
        >
          {r ? t("summary.toDose") : t("summary.toRecipe")}
        </Button>
      </div>
    );
  const setting = derived.setting;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const grindText =
    setting?.kind === "ok"
      ? derived.grinder
        ? settingText(derived.grinder, setting).text
        : setting.text
      : null;

  return (
    <div>
      <StepTitle>{r.name}</StepTitle>
      <p className="mt-2 text-fg-muted">
        {t("recipe.by", { author: r.author })}
      </p>

      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6">
        <Fact label={t("amount.dose")} index={0}>
          <Quantity value={s.dose} unit="g" kind="coffee" />
        </Fact>
        <Fact label={t("amount.water")} index={1}>
          <Quantity
            value={s.water}
            unit={s.bypass ? `g + ${s.bypass.grams}` : "g"}
            kind="water"
          />
        </Fact>
        <Fact label={t("summary.temp")} index={2}>
          <Quantity value={derived.tempC} unit="°C" />
        </Fact>
        <Fact label={t("summary.time")} index={3}>
          <Quantity value={formatClock(s.totalSeconds)} kind="water" />
        </Fact>
      </dl>

      <div className="stagger-in mt-8" style={{ "--i": 4 } as CSSProperties}>
        <p className="text-sm text-fg-faint">
          {derived.grinder
            ? t("summary.grindOn", {
                grinder: `${derived.grinder.brand} ${derived.grinder.model}`,
              })
            : t("summary.grind")}
        </p>
        {grindText ? (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <span className="num text-[2.75rem] text-fg">{grindText}</span>
            <span className="tabular text-fg-faint">
              {t("grinder.tolerance", {
                n: setting?.kind === "ok" ? setting.tolerance : 1,
              })}
            </span>
            <span className="text-fg-muted">
              {t(`texture.${r.grind.texture}`)}
              {selection.grindOffset
                ? `, ${t("grinder.offsetLabel", { n: `${selection.grindOffset > 0 ? "+" : ""}${selection.grindOffset}` })}`
                : ""}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-fg-muted">
            {t(`texture.${r.grind.texture}`)}
          </p>
        )}
      </div>

      <div className="stagger-in mt-9" style={{ "--i": 5 } as CSSProperties}>
        <h2 className="display text-xl text-fg">{t("summary.schedule")}</h2>
        <ol className="mt-3">
          {s.steps.map((st) => (
            <li
              key={`${st.at}-${st.action}-${st.cumulative}`}
              className="grid grid-cols-[3.25rem_1fr_auto] items-baseline gap-x-3 border-t border-line py-3 first:border-t-0"
            >
              <span className="tabular text-water">{formatClock(st.at)}</span>
              <span className="text-fg">
                {fillStepText(L(st.text), st, s.dose)}
                {st.note ? (
                  <span className="mt-0.5 block text-sm text-fg-faint">
                    {L(st.note)}
                  </span>
                ) : null}
              </span>
              {st.water ? (
                <span className="tabular font-semibold text-water">
                  {st.cumulative} g
                </span>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ol>
      </div>

      <details className="mt-6 rounded-[var(--radius)] bg-surface-2 px-4 py-3">
        <summary className="cursor-pointer text-fg-muted">
          {t("summary.chart")}
        </summary>
        <div className="mt-3">
          <ControlChart
            extraction={catalog.extraction}
            method={r.method}
            dose={s.dose}
            water={s.water}
          />
        </div>
      </details>

      <p className="mt-6 text-sm text-fg-faint">
        {t("summary.source")}:{" "}
        <a
          className="underline underline-offset-2"
          href={r.source.url}
          target="_blank"
          rel="noreferrer"
        >
          {r.source.title}
        </a>
        .{r.source.notes ? ` ${L(r.source.notes)}` : ""}{" "}
        <a className="underline underline-offset-2" href="/sources">
          {t("app.sources")}
        </a>
      </p>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={share}>
          <Crossfade id={copied ? "copied" : "share"}>
            {copied ? t("nav.copied") : t("nav.share")}
          </Crossfade>
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            primeBrewAudio();
            send({ type: "START" });
          }}
        >
          {t("nav.start")}
        </Button>
      </div>
    </div>
  );
}

function Fact({
  label,
  index,
  children,
}: {
  label: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div className="stagger-in" style={{ "--i": index } as CSSProperties}>
      <dt className="sr-only">{label}</dt>
      <dd>
        {children}
        <span aria-hidden="true" className="mt-1.5 block text-sm text-fg-faint">
          {label}
        </span>
      </dd>
    </div>
  );
}
