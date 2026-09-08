"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Selectable card and chip. Both are real buttons with aria-pressed so keyboard and
  screen readers get the state. Selection is shown by size, weight and one accent,
  not by a heavy border.
*/

export function ChoiceCard({
  selected,
  onSelect,
  title,
  hint,
  meta,
  aside,
  className,
  style,
}: {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  hint?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={style}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,transform,box-shadow] duration-150 ease-[var(--ease-out)] active:scale-[0.98]",
        selected
          ? "border-accent/60 bg-surface-2 shadow-[0_0_0_1px_oklch(0.8_0.09_78/0.35)]"
          : "border-line bg-surface hover:border-line-strong hover:bg-surface-2/70",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-4 right-4 h-2 w-2 rounded-full bg-accent transition-[transform,opacity] duration-200 ease-[var(--ease-out)]",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
      {aside ? <div className="shrink-0">{aside}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "font-semibold tracking-tight",
              selected ? "text-accent" : "text-fg",
            )}
          >
            {title}
          </span>
          {meta ? (
            <span
              className={cn(
                "tabular shrink-0 text-xs text-fg-faint transition-transform duration-200 ease-[var(--ease-out)]",
                selected && "-translate-x-4",
              )}
            >
              {meta}
            </span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-1 text-sm leading-snug text-fg-muted">{hint}</p>
        ) : null}
      </div>
    </button>
  );
}

export function Chip({
  selected,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96]",
        selected
          ? "chip-pop border-accent bg-accent text-accent-ink"
          : "border-line-strong bg-transparent text-fg hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
      {children}
    </p>
  );
}

export function StepTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-[2rem] leading-[1.05] tracking-tight text-fg sm:text-4xl">
      {children}
    </h1>
  );
}
