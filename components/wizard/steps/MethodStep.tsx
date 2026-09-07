"use client";

import { useTranslations } from "next-intl";
import { ChoiceCard, StepTitle } from "@/components/ui/choice";
import type { Method } from "@/lib/schema";
import type { StepProps } from "./types";

const METHODS: Method[] = ["v60", "aeropress"];

export function MethodStep({ selection, send }: StepProps) {
  const t = useTranslations("method");
  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>
      <div className="mt-6 grid gap-3">
        {METHODS.map((m) => (
          <ChoiceCard
            key={m}
            selected={selection.method === m}
            onSelect={() => send({ type: "SELECT_METHOD", method: m })}
            title={t(m)}
            hint={t(`${m}Hint`)}
          />
        ))}
      </div>
    </div>
  );
}
