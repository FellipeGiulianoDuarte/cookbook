"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";
import { cn } from "@/lib/cn";

const LABEL: Record<string, string> = { en: "EN", "pt-BR": "PT" };

/*
  Two labels and one sliding pill. The pill moves the moment you tap, before the server has
  switched the locale, so the toggle answers instantly even though the page text follows a
  refresh later. Transform only, so the slide stays smooth while the refresh is rendering.
*/
export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("app");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState(locale);
  useEffect(() => setActive(locale), [locale]);
  const index = Math.max(
    0,
    LOCALES.indexOf(active as (typeof LOCALES)[number]),
  );

  return (
    <nav
      className="relative flex items-center rounded-full border border-line-strong p-0.5"
      aria-label={t("language")}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 rounded-full bg-accent transition-[transform,opacity] duration-[220ms] ease-[var(--ease-out)]"
        style={{
          width: `calc((100% - 4px) / ${LOCALES.length})`,
          transform: `translateX(${index * 100}%)`,
          opacity: pending ? 0.75 : 1,
        }}
      />
      {LOCALES.map((l) => {
        const on = l === active;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={on}
            disabled={pending}
            onClick={() => {
              if (l === active) return;
              setActive(l);
              start(async () => {
                await setLocale(l);
                router.refresh();
              });
            }}
            className={cn(
              "relative z-10 h-8 rounded-full px-3 text-xs font-semibold transition-[color,transform] duration-[180ms] ease-[var(--ease-out)] active:scale-95",
              on ? "text-accent-ink" : "text-fg-muted hover:text-fg",
            )}
          >
            {LABEL[l]}
          </button>
        );
      })}
    </nav>
  );
}
