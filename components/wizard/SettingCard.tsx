"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Crossfade } from "@/components/ui/crossfade";
import type { Derived } from "@/lib/derive";
import type { Selection, WizardEvent } from "@/lib/machine";
import type { Grinder, Recipe } from "@/lib/schema";
import { useLocalized } from "@/lib/use-localized";
import { useSettingText } from "@/lib/use-setting-text";

/*
  The grinder setting for the chosen recipe: the value in the grinder's notation, the
  tolerance, where it sits inside the grinder's band, the basis of the number, and the
  per-user offset. Never a bare integer.
*/
export function SettingCard({
  grinder,
  recipe,
  derived,
  selection,
  send,
  aside,
}: {
  aside?: React.ReactNode;
  grinder: Grinder;
  recipe: Recipe;
  derived: Derived;
  selection: Selection;
  send: (e: WizardEvent) => void;
}) {
  const t = useTranslations("grinder");
  const L = useLocalized();
  const [showZero, setShowZero] = useState(false);
  const s = derived.setting;
  const settingText = useSettingText();
  const shown = s ? settingText(grinder, s) : { text: "" };

  // "18 clicks" → big "18" + small "clicks"; notations without a leading number stay whole.
  const m = /^(\D*?)(\d[\d.]*)(.*)$/.exec(shown.text);
  const official =
    s?.kind === "ok" && s.official && s.basis !== "official"
      ? s.official[0] === s.official[1]
        ? `${s.official[0]}`
        : `${s.official[0]}–${s.official[1]}`
      : null;

  return (
    <div className="overflow-x-clip">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[1.0625rem] font-semibold tracking-tight text-fg">
          {grinder.brand} {grinder.model}
        </p>
        {aside}
      </div>

      {s?.kind === "ok" ? (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Crossfade id={shown.text} className="text-fg">
              <span className="sr-only">{shown.text}</span>
              {m ? (
                <span
                  aria-hidden="true"
                  className="inline-flex items-baseline gap-2"
                >
                  {m[1] ? (
                    <span className="num-unit text-lg text-fg-muted">
                      {m[1].trim()}
                    </span>
                  ) : null}
                  <span className="num text-[6.5rem]">{m[2]}</span>
                  <span className="num-unit text-lg text-fg-muted">
                    {m[3].trim()}
                  </span>
                </span>
              ) : (
                <span aria-hidden="true" className="num text-[4rem]">
                  {shown.text}
                </span>
              )}
            </Crossfade>
            <span className="tabular text-lg text-fg-faint">
              {t("tolerance", { n: s.tolerance })}
            </span>
          </div>
          {shown.detail ? (
            <p className="text-sm text-fg-faint">{shown.detail}</p>
          ) : null}

          <BandBar
            lo={s.band[0]}
            hi={s.band[1]}
            value={s.value}
            fine={t("fine")}
            coarse={t("coarse")}
          />
          <p className="mt-2 text-sm text-fg-faint">
            {t("bandBasis", {
              method: recipe.grind.band,
              basis: t(`basis.${s.basis}`),
            })}
            {official
              ? ` ${t("officialRef", { brand: grinder.brand, range: official })}`
              : ""}
          </p>

          {s.unsafe ? (
            <p className="mt-3 text-sm text-danger">
              {t("unsafe", { n: grinder.zero.unsafeBelow ?? 0 })}
            </p>
          ) : null}
          {s.outOfRange && !s.unsafe ? (
            <p className="mt-3 text-sm text-warn">{t("outOfRange")}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-fg-muted">
          {s?.kind === "unknown" && s.reason === "not-capable"
            ? t("notCapable")
            : t("noBand")}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-fg-muted">{t("offset")}</span>
          <div className="flex items-center rounded-full bg-surface-2">
            <button
              type="button"
              aria-label="−1"
              className="h-11 w-11 rounded-full text-lg text-fg transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-surface-3 active:scale-90"
              onClick={() =>
                send({ type: "SET_OFFSET", offset: selection.grindOffset - 1 })
              }
            >
              −
            </button>
            <span className="tabular w-9 text-center font-semibold">
              {selection.grindOffset > 0
                ? `+${selection.grindOffset}`
                : selection.grindOffset}
            </span>
            <button
              type="button"
              aria-label="+1"
              className="h-11 w-11 rounded-full text-lg text-fg transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-surface-3 active:scale-90"
              onClick={() =>
                send({ type: "SET_OFFSET", offset: selection.grindOffset + 1 })
              }
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={showZero}
          className="text-sm text-water underline-offset-4 hover:underline"
          onClick={() => setShowZero((v) => !v)}
        >
          {t("zero")}
        </button>
      </div>
      <p className="mt-2 text-sm text-fg-faint">{t("offsetHint")}</p>
      {showZero ? (
        <p className="mt-3 rounded-[var(--radius)] bg-surface-2 px-4 py-3 text-sm text-fg-muted">
          {L(grinder.zero.procedure)}
        </p>
      ) : null}
      {grinder.travelMicronsPerClick ? (
        <p className="mt-2 text-sm text-fg-faint">
          {t("travelNote", { n: grinder.travelMicronsPerClick })}
        </p>
      ) : null}
    </div>
  );
}

/** Where the setting sits in the band: a scale with the value as a milk-white marker. */
function BandBar({
  lo,
  hi,
  value,
  fine,
  coarse,
}: {
  lo: number;
  hi: number;
  value: number;
  fine: string;
  coarse: string;
}) {
  const span = Math.max(hi - lo, 1);
  const pct = Math.min(100, Math.max(0, ((value - lo) / span) * 100));
  return (
    <div className="mt-5">
      <div className="relative h-5">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex h-full items-end justify-between"
        >
          {Array.from({ length: 11 }, (_, i) => i).map((i) => (
            <span
              key={i}
              className={
                i % 5 === 0
                  ? "block h-3 w-px bg-fg-faint"
                  : "block h-1.5 w-px bg-line-strong"
              }
            />
          ))}
        </div>
        <div
          className="absolute inset-y-0 left-0 w-full transition-transform duration-300 ease-[var(--ease-out)]"
          style={{ transform: `translateX(${pct}%)` }}
        >
          <div className="h-5 w-[3px] -translate-x-1/2 rounded-full bg-fg" />
        </div>
      </div>
      <div className="tabular mt-1.5 flex justify-between text-sm text-fg-faint">
        <span>
          {lo} {fine}
        </span>
        <span>
          {hi} {coarse}
        </span>
      </div>
    </div>
  );
}
