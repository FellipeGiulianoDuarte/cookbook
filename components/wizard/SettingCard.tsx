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
}: {
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

  return (
    <div className="overflow-x-clip rounded-2xl border border-line bg-surface p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
        {t("setting")} · {grinder.brand} {grinder.model}
      </p>

      {s?.kind === "ok" ? (
        <>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Crossfade
              id={shown.text}
              className="tabular font-display text-5xl leading-none tracking-tight text-fg"
            >
              {shown.text}
            </Crossfade>
            <span className="tabular text-fg-muted">
              {t("tolerance", { n: s.tolerance })}
            </span>
            {shown.detail ? (
              <span className="text-sm text-fg-faint">{shown.detail}</span>
            ) : null}
          </div>

          <BandBar
            lo={s.band[0]}
            hi={s.band[1]}
            value={s.value}
            fine={t("fine")}
            coarse={t("coarse")}
          />
          <p className="mt-1 text-xs text-fg-faint">
            {t("band", { method: recipe.grind.band })} · {t(`basis.${s.basis}`)}
            {s.official && s.basis !== "official" ? (
              <>
                {" · "}
                {t("officialRef", {
                  brand: grinder.brand,
                  range:
                    s.official[0] === s.official[1]
                      ? `${s.official[0]}`
                      : `${s.official[0]}–${s.official[1]}`,
                })}
              </>
            ) : null}
          </p>

          {s.unsafe ? (
            <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {t("unsafe", { n: grinder.zero.unsafeBelow ?? 0 })}
            </p>
          ) : null}
          {s.outOfRange && !s.unsafe ? (
            <p className="mt-3 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn">
              {t("outOfRange")}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-fg-muted">
          {s?.kind === "unknown" && s.reason === "not-capable"
            ? t("notCapable")
            : t("noBand")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">{t("offset")}</span>
          <div className="flex items-center overflow-hidden rounded-full border border-line-strong">
            <button
              type="button"
              aria-label="−1"
              className="h-10 w-10 rounded-full text-lg text-fg transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-surface-2 active:scale-90 active:bg-espresso-700"
              onClick={() =>
                send({ type: "SET_OFFSET", offset: selection.grindOffset - 1 })
              }
            >
              −
            </button>
            <span className="tabular w-10 text-center font-semibold">
              {selection.grindOffset > 0
                ? `+${selection.grindOffset}`
                : selection.grindOffset}
            </span>
            <button
              type="button"
              aria-label="+1"
              className="h-10 w-10 rounded-full text-lg text-fg transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-surface-2 active:scale-90 active:bg-espresso-700"
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
          className="text-sm text-accent underline-offset-4 hover:underline"
          onClick={() => setShowZero((v) => !v)}
        >
          {t("zero")}
        </button>
      </div>
      <p className="mt-1 text-xs text-fg-faint">{t("offsetHint")}</p>
      {showZero ? (
        <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-sm text-fg-muted">
          {L(grinder.zero.procedure)}
        </p>
      ) : null}
      {grinder.travelMicronsPerClick ? (
        <p className="mt-2 text-xs text-fg-faint">
          {t("travelNote", { n: grinder.travelMicronsPerClick })}
        </p>
      ) : null}
    </div>
  );
}

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
    <div className="mt-4">
      <div className="relative h-2 rounded-full bg-line">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-accent/30" />
        <div
          className="absolute top-1/2 left-0 h-0 w-full transition-transform duration-300 ease-[var(--ease-out)]"
          style={{ transform: `translateX(${pct}%)` }}
        >
          <div className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_oklch(0.8_0.09_78/0.2)]" />
        </div>
      </div>
      <div className="tabular mt-1.5 flex justify-between text-xs text-fg-faint">
        <span>
          {lo} · {fine}
        </span>
        <span>
          {hi} · {coarse}
        </span>
      </div>
    </div>
  );
}
