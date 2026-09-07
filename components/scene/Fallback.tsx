"use client";

import type { Method } from "@/lib/schema";

/*
  Static illustration of the brewer. Used until the 3D scene loads, when WebGL is
  missing, and when the user prefers reduced motion. `fill` (0..1) sets the liquid level
  through a CSS variable so the timer can still show progress here.
*/
export function Fallback({
  method,
  fill = 0,
  className,
}: {
  method?: Method;
  fill?: number;
  className?: string;
}) {
  const level = Math.min(1, Math.max(0, fill));
  return (
    <div
      className={className}
      style={{ ["--fill" as string]: level }}
      aria-hidden="true"
      data-scene-fallback={method ?? "none"}
    >
      {method === "aeropress" ? (
        <AeroPressSvg level={level} />
      ) : (
        <V60Svg level={level} />
      )}
    </div>
  );
}

function V60Svg({ level }: { level: number }) {
  // cone from y=40 (top, x 40..160) to y=118 (spout, x 88..112)
  const topY = 40 + (1 - level) * 78;
  const halfAtY = (y: number) => 60 - ((y - 40) / 78) * 48; // 60 → 12
  const hw = halfAtY(topY);
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <ellipse cx="100" cy="132" rx="70" ry="8" fill="oklch(0 0 0 / 0.45)" />
      {level > 0 ? (
        <path
          d={`M${100 - hw} ${topY} L${100 + hw} ${topY} L112 118 L88 118 Z`}
          fill="oklch(0.38 0.06 45)"
          style={{ transition: "d 300ms var(--ease)" }}
        />
      ) : null}
      <path
        d="M40 40 L160 40 L112 118 L88 118 Z"
        fill="oklch(0.8 0.09 78 / 0.08)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      <path
        d="M46 46 L154 46"
        stroke="var(--color-accent)"
        strokeOpacity="0.35"
      />
      <rect
        x="86"
        y="118"
        width="28"
        height="8"
        rx="2"
        fill="oklch(0.29 0.02 56)"
      />
    </svg>
  );
}

function AeroPressSvg({ level }: { level: number }) {
  const chamberTop = 30;
  const chamberBottom = 120;
  const liquidTop = chamberBottom - level * (chamberBottom - chamberTop - 10);
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <ellipse cx="100" cy="136" rx="60" ry="7" fill="oklch(0 0 0 / 0.45)" />
      {level > 0 ? (
        <rect
          x="72"
          y={liquidTop}
          width="56"
          height={chamberBottom - liquidTop}
          fill="oklch(0.38 0.06 45)"
        />
      ) : null}
      <rect
        x="70"
        y={chamberTop}
        width="60"
        height={chamberBottom - chamberTop}
        rx="6"
        fill="oklch(0.8 0.09 78 / 0.06)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      <rect
        x="66"
        y="118"
        width="68"
        height="10"
        rx="3"
        fill="oklch(0.29 0.02 56)"
      />
      <rect
        x="82"
        y="8"
        width="36"
        height="26"
        rx="4"
        fill="oklch(0.22 0.016 58)"
        stroke="var(--color-accent)"
        strokeOpacity="0.6"
      />
      <rect
        x="96"
        y="0"
        width="8"
        height="10"
        rx="2"
        fill="oklch(0.29 0.02 56)"
      />
    </svg>
  );
}
