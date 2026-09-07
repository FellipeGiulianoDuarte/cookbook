"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";

const LABEL: Record<string, string> = { en: "EN", "pt-BR": "PT" };

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("app");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <nav
      className="flex items-center rounded-full border border-line-strong p-0.5"
      aria-label={t("language")}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setLocale(l);
              router.refresh();
            })
          }
          className={`h-8 rounded-full px-3 text-xs font-semibold transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-95 ${
            l === locale
              ? "bg-accent text-accent-ink"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </nav>
  );
}
