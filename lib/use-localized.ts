"use client";

import { useLocale } from "next-intl";
import { useCallback } from "react";
import type { Locale, LocalizedText } from "./schema";

/** Pick the current locale's string out of a LocalizedText field from the data. */
export function useLocalized() {
  const locale = useLocale() as Locale;
  return useCallback(
    (t: LocalizedText | undefined) => (t ? (t[locale] ?? t.en) : ""),
    [locale],
  );
}
