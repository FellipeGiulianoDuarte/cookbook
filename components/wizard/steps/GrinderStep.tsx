"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useMemo, useState } from "react";
import { Eyebrow, StepTitle } from "@/components/ui/choice";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { readMyGrinder, writeMyGrinder } from "@/lib/my-grinder";
import type { Grinder } from "@/lib/schema";
import { SettingCard } from "../SettingCard";
import type { CatalogStepProps, DerivedStepProps } from "./types";

const RECENT_KEY = "cookbook:recent-grinders";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  try {
    const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function GrinderStep({
  catalog,
  selection,
  derived,
  send,
}: CatalogStepProps & DerivedStepProps) {
  const t = useTranslations("grinder");
  const [q, setQ] = useState("");
  const [recent] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readRecent(),
  );
  const [mine, setMine] = useState<string | undefined>(() =>
    typeof window === "undefined" ? undefined : readMyGrinder(),
  );
  const toggleMine = (g: Grinder) => {
    const next = mine === g.id ? undefined : g.id;
    setMine(next);
    writeMyGrinder(next);
    if (next) send({ type: "SELECT_GRINDER", grinderId: next });
  };
  const myGrinder = mine
    ? catalog.grinders.find((g) => g.id === mine)
    : undefined;

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return catalog.grinders;
    return catalog.grinders.filter((g) =>
      `${g.brand} ${g.model} ${(g.aliases ?? []).join(" ")}`
        .toLowerCase()
        .includes(needle),
    );
  }, [catalog.grinders, q]);

  const recentGrinders = recent
    .map((id) => catalog.grinders.find((g) => g.id === id))
    .filter((g): g is Grinder => g !== undefined && g.id !== mine);

  const describe = (g: Grinder) =>
    [
      t(`kind.${g.kind}`),
      t(`adjustment.${g.adjustment}`),
      g.clicksPerRotation ? t("perTurn", { n: g.clicksPerRotation }) : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const select = (g: Grinder) => {
    pushRecent(g.id);
    send({ type: "SELECT_GRINDER", grinderId: g.id });
  };

  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>

      {derived.grinder && derived.recipe ? (
        <div className="stagger-in mt-5">
          <SettingCard
            grinder={derived.grinder}
            recipe={derived.recipe}
            derived={derived}
            selection={selection}
            send={send}
          />
        </div>
      ) : null}

      <label className="mt-6 block">
        <span className="sr-only">{t("search")}</span>
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder={t("search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-base text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none"
        />
      </label>

      {!q && myGrinder ? (
        <>
          <Eyebrow>
            <span className="mt-5 block">{t("mine")}</span>
          </Eyebrow>
          <GrinderList
            grinders={[myGrinder]}
            selectedId={selection.grinderId}
            onSelect={select}
            describe={describe}
            mine={mine}
            onToggleMine={toggleMine}
          />
          <p className="mt-2 text-xs text-fg-faint">{t("mineHint")}</p>
        </>
      ) : null}

      {!q && recentGrinders.length ? (
        <>
          <Eyebrow>
            <span className="mt-5 block">{t("recent")}</span>
          </Eyebrow>
          <GrinderList
            grinders={recentGrinders}
            selectedId={selection.grinderId}
            onSelect={select}
            describe={describe}
            mine={mine}
            onToggleMine={toggleMine}
          />
        </>
      ) : null}

      <div className="mt-5">
        <Eyebrow>{q ? `${matches.length}` : t("all")}</Eyebrow>
      </div>
      <GrinderList
        grinders={matches}
        selectedId={selection.grinderId}
        onSelect={select}
        describe={describe}
        mine={mine}
        onToggleMine={toggleMine}
      />
    </div>
  );
}

function GrinderList({
  grinders,
  selectedId,
  onSelect,
  describe,
  mine,
  onToggleMine,
}: {
  grinders: Grinder[];
  selectedId?: string;
  onSelect: (g: Grinder) => void;
  describe: (g: Grinder) => string;
  mine?: string;
  onToggleMine: (g: Grinder) => void;
}) {
  const t = useTranslations("grinder");
  return (
    <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
      {grinders.map((g, i) => {
        const on = g.id === selectedId;
        return (
          <li
            key={g.id}
            className={cn(
              "stagger-in flex items-stretch transition-[background-color] duration-150",
              on && "bg-surface-2",
            )}
            style={{ "--i": Math.min(i, 8) } as CSSProperties}
          >
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(g)}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left transition-[background-color] duration-150 hover:bg-surface-2 active:bg-surface-2"
            >
              <span>
                <span
                  className={cn(
                    "block font-medium",
                    on ? "text-accent" : "text-fg",
                  )}
                >
                  {g.brand} {g.model}
                </span>
                <span className="block text-xs text-fg-faint">
                  {describe(g)}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full bg-accent transition-[transform,opacity] duration-200 ease-[var(--ease-out)]",
                  on ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
            </button>
            <button
              type="button"
              aria-pressed={mine === g.id}
              aria-label={mine === g.id ? t("unstar") : t("star")}
              title={mine === g.id ? t("unstar") : t("star")}
              onClick={() => onToggleMine(g)}
              className={cn(
                "flex w-12 shrink-0 items-center justify-center transition-[color,transform] duration-150 ease-[var(--ease-out)] active:scale-90",
                mine === g.id
                  ? "chip-pop text-accent"
                  : "text-fg-faint hover:text-fg",
              )}
            >
              <StarIcon filled={mine === g.id} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
