"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

/*
  Selectable row and chip. Both are real buttons with aria-pressed so keyboard and screen
  readers get the state. Rows are not cards: they sit on the sheet, and the chosen one is
  marked by a raised ground and a short amber mark on the left, like a line on a scale.
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
      onClick={() => {
        haptic("select");
        onSelect();
      }}
      style={style}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-[var(--radius)] py-4 pr-4 pl-6 text-left transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.985]",
        selected ? "bg-surface-2" : "hover:bg-surface-2/60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-5 left-2.5 h-5 w-[3px] origin-center rounded-full bg-coffee transition-[transform,opacity] duration-200 ease-[var(--ease-out)]",
          selected ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
        )}
      />
      {aside ? <div className="shrink-0">{aside}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[1.0625rem] font-semibold tracking-tight text-fg">
            {title}
          </span>
          {meta ? (
            <span className="tabular shrink-0 text-sm text-water">{meta}</span>
          ) : null}
        </div>
        {hint ? (
          <div className="mt-1 text-[0.9375rem] leading-snug text-fg-muted">
            {hint}
          </div>
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
      onClick={() => {
        haptic("select");
        onSelect();
      }}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96]",
        selected
          ? "chip-pop bg-fg text-bg"
          : "bg-surface-2 text-fg hover:bg-surface-3",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A short sentence-case label above a group of controls. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-fg-faint">{children}</p>;
}

export function StepTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      id="step-title"
      className="display text-[2.125rem] leading-[1.02] text-fg sm:text-[2.5rem]"
    >
      {children}
    </h1>
  );
}

/**
 * A measured quantity: the number big and condensed, the unit small beside it.
 * `kind` picks the colour by what is measured.
 */
export function Quantity({
  value,
  unit,
  kind = "plain",
  size = "md",
  className,
}: {
  value: ReactNode;
  unit?: ReactNode;
  kind?: "coffee" | "water" | "plain";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const color =
    kind === "coffee"
      ? "text-coffee"
      : kind === "water"
        ? "text-water"
        : "text-fg";
  const sizes = {
    sm: "text-[1.75rem]",
    md: "text-[2.75rem]",
    lg: "text-[4.25rem]",
    xl: "text-[6.5rem]",
  } as const;
  return (
    <span className={cn("inline-flex items-baseline gap-1", color, className)}>
      {/* read as one phrase ("20 g"); the styled pieces are for the eye */}
      <span className="sr-only">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
      <span aria-hidden="true" className={cn("num", sizes[size])}>
        {value}
      </span>
      {unit ? (
        <span
          aria-hidden="true"
          className="num-unit text-base text-current opacity-75"
        >
          {unit}
        </span>
      ) : null}
    </span>
  );
}
