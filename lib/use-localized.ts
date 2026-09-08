"use client";

import { useLocale } from "next-intl";
import { useCallback } from "react";
import type { Locale, LocalizedText, Note } from "./schema";

/** Pick the current locale's string out of a LocalizedText or Note field from the data. */
export function useLocalized() {
  const locale = useLocale() as Locale;
  return useCallback(
    (t: LocalizedText | Note | undefined) =>
      t === undefined ? "" : typeof t === "string" ? t : (t[locale] ?? t.en),
    [locale],
  );
}
