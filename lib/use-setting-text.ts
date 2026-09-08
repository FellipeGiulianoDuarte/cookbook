"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { formatSetting, type Setting, type SettingWords } from "./engine/grind";
import type { Grinder } from "./schema";

/** The engine formats in English; this re-renders a setting's text in the UI language. */
export function useSettingText() {
  const t = useTranslations("grinder.units");
  return useCallback(
    (grinder: Grinder, s: Setting): { text: string; detail?: string } => {
      if (s.kind !== "ok") return { text: "" };
      const words: SettingWords = {
        clicks: t("clicks"),
        setting: t("setting"),
        mark: t("mark"),
        turn: t("turn"),
        turns: t("turns"),
        fromZero: t("fromZero"),
        countedFromZero: t("countedFromZero"),
        clicksFromZero: t("clicksFromZero"),
        step: t("step"),
        position: (i, n) => t("position", { i, n }),
      };
      return formatSetting(grinder, s.value, words);
    },
    [t],
  );
}
