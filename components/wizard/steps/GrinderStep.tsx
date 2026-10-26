"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow, StepTitle } from "@/components/ui/choice";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
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
    haptic("select");
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
    haptic("select");
    pushRecent(g.id);
    send({ type: "SELECT_GRINDER", grinderId: g.id });
  };

  const chosen =
    derived.grinder && derived.recipe ? derived.grinder : undefined;
  // With a grinder chosen the step is about its setting; the picker folds away.
  const [picking, setPicking] = useState(false);
  const showPicker = !chosen || picking;
  const starButton = (g: Grinder) => (
    <button
      type="button"
      aria-pressed={mine === g.id}
      aria-label={mine === g.id ? t("unstar") : t("star")}
      title={mine === g.id ? t("unstar") : t("star")}
      onClick={() => toggleMine(g)}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-surface-2 active:scale-90",
        mine === g.id ? "chip-pop text-coffee" : "text-fg-faint hover:text-fg",
      )}
    >
      <StarIcon filled={mine === g.id} />
    </button>
  );

  return (
    <div>
      <StepTitle>{t("title")}</StepTitle>

      {chosen && derived.recipe ? (
        <div className="stagger-in mt-5">
          <SettingCard
            grinder={chosen}
            recipe={derived.recipe}
            derived={derived}
            selection={selection}
            send={send}
            aside={starButton(chosen)}
          />
          {mine !== chosen.id ? null : (
            <p className="mt-3 text-sm text-fg-faint">{t("mineHint")}</p>
          )}
          <Button
            variant="secondary"
            size="md"
            className="mt-6"
            aria-expanded={picking}
            onClick={() => {
              setPicking((v) => !v);
              setQ("");
            }}
          >
            {picking ? t("done") : t("change")}
          </Button>
        </div>
      ) : null}

      {showPicker ? (
        <div className={chosen ? "stagger-in mt-6" : "mt-5"}>
          <label className="block">
            <span className="sr-only">{t("search")}</span>
            <input
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder={t("search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 w-full rounded-full bg-surface-2 px-5 text-base text-fg placeholder:text-fg-faint focus:outline-2 focus:outline-water"
            />
          </label>

          {!q && myGrinder ? (
            <>
              <div className="mt-6">
                <Eyebrow>{t("mine")}</Eyebrow>
              </div>
              <GrinderList
                grinders={[myGrinder]}
                selectedId={selection.grinderId}
                onSelect={select}
                describe={describe}
                star={starButton}
              />
            </>
          ) : null}

          {!q && recentGrinders.length ? (
            <>
              <div className="mt-6">
                <Eyebrow>{t("recent")}</Eyebrow>
              </div>
              <GrinderList
                grinders={recentGrinders}
                selectedId={selection.grinderId}
                onSelect={select}
                describe={describe}
                star={starButton}
              />
            </>
          ) : null}

          <div className="mt-6">
            <Eyebrow>
              {q ? t("matches", { n: matches.length }) : t("all")}
            </Eyebrow>
          </div>
          <GrinderList
            grinders={matches}
            selectedId={selection.grinderId}
            onSelect={select}
            describe={describe}
            star={starButton}
          />
        </div>
      ) : null}
    </div>
  );
}

function GrinderList({
  grinders,
  selectedId,
  onSelect,
  describe,
  star,
}: {
  grinders: Grinder[];
  selectedId?: string;
  onSelect: (g: Grinder) => void;
  describe: (g: Grinder) => string;
  star: (g: Grinder) => React.ReactNode;
}) {
  return (
    <ul className="-mx-2 mt-1 grid gap-0.5">
      {grinders.map((g, i) => {
        const on = g.id === selectedId;
        return (
          <li
            key={g.id}
            className={cn(
              "stagger-in relative flex items-center rounded-[var(--radius)] pr-1 transition-[background-color] duration-150",
              on ? "bg-surface-2" : "hover:bg-surface-2/60",
            )}
            style={{ "--i": Math.min(i, 8) } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-2.5 h-5 w-[3px] -translate-y-1/2 rounded-full bg-coffee transition-[opacity] duration-200",
                on ? "opacity-100" : "opacity-0",
              )}
            />
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(g)}
              className="min-w-0 flex-1 py-3 pr-2 pl-6 text-left active:scale-[0.99]"
            >
              <span className="block font-medium text-fg">
                {g.brand} {g.model}
              </span>
              <span className="block text-sm text-fg-faint">{describe(g)}</span>
            </button>
            {star(g)}
          </li>
        );
      })}
    </ul>
  );
}
