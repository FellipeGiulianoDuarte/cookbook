"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  checkRange,
  eyFromBeverage,
  eyFromWater,
  type Family,
  ratioGPerL,
  tdsWindow,
  zoneFor,
} from "@/lib/engine/extraction";
import type { Extraction, Method } from "@/lib/schema";
import { useLocalized } from "@/lib/use-localized";

/*
  The brewing control chart, built only from published numbers: SCA ranges, the UC Davis
  corner descriptors and directions, and mass balance. Without a refractometer reading it
  shows the TDS window implied by the ratio. It never predicts a point from grind or heat.
*/

export function ControlChart({
  extraction,
  method,
  dose,
  water,
}: {
  extraction: Extraction;
  method: Method;
  dose: number;
  water: number;
}) {
  const t = useTranslations("chart");
  const L = useLocalized();
  const [tds, setTds] = useState<string>("");
  const [beverage, setBeverage] = useState<string>("");

  const family: Family =
    method === "aeropress" || method === "frenchpress"
      ? "immersion"
      : "percolation";
  const lrr =
    method === "v60" ? extraction.lrr.percolation : extraction.lrr.drip;
  const ratio = ratioGPerL(dose, water);
  const window = tdsWindow(extraction.chart.sca.ey, water, dose, family, lrr);

  const point = useMemo(() => {
    const tdsN = Number.parseFloat(tds.replace(",", "."));
    if (!Number.isFinite(tdsN) || tdsN <= 0) return null;
    const bevN = Number.parseFloat(beverage.replace(",", "."));
    const ey =
      Number.isFinite(bevN) && bevN > 0
        ? eyFromBeverage(tdsN, bevN, dose)
        : eyFromWater(tdsN, water, dose, family, lrr);
    return { tds: tdsN, ey, zone: zoneFor(tdsN, ey, extraction) };
  }, [tds, beverage, dose, water, family, lrr, extraction]);

  return (
    <section className="rounded-2xl bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
        {t("title")}
      </p>
      <p className="mt-1 text-sm text-fg-muted">{t("intro")}</p>

      <ChartSvg
        extraction={extraction}
        slope={
          family === "immersion"
            ? dose / (water + dose)
            : dose / (water - lrr * dose)
        }
        point={point}
        L={L}
      />

      <p className="tabular mt-2 text-sm text-fg-muted">
        {t("window", {
          ratio,
          lo: window[0].toFixed(2),
          hi: window[1].toFixed(2),
        })}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-xs text-fg-faint">
          {t("reading")}
          <input
            inputMode="decimal"
            placeholder="1.30"
            value={tds}
            onChange={(e) => setTds(e.target.value)}
            className="tabular mt-1 h-12 w-full rounded-xl border border-line-strong bg-bg px-3 text-base text-fg focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs text-fg-faint">
          {t("beverage")}
          <input
            inputMode="decimal"
            placeholder={String(Math.round(water - lrr * dose))}
            value={beverage}
            onChange={(e) => setBeverage(e.target.value)}
            className="tabular mt-1 h-12 w-full rounded-xl border border-line-strong bg-bg px-3 text-base text-fg focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {point ? (
        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p className="tabular text-fg">
            TDS {point.tds.toFixed(2)} % · EY {point.ey.toFixed(1)} %
          </p>
          {point.zone.insideSca ? (
            <p className="mt-1 text-ok">{t("inside")}</p>
          ) : (
            <p className="mt-1 text-fg-muted">
              {t("outside")}{" "}
              {point.zone.corner
                ? point.zone.corner.attributes.map((a) => L(a)).join(", ")
                : ""}
            </p>
          )}
          <p className="mt-1 text-xs text-fg-faint">{t("preference")}</p>
          {checkRange(ratio, extraction.chart.sca.ratioGPerL) !== "in" ? (
            <p className="mt-1 text-xs text-fg-faint">
              {ratio} g/L is outside the SCA ratio band (
              {extraction.chart.sca.ratioGPerL[0]}–
              {extraction.chart.sca.ratioGPerL[1]} g/L).
            </p>
          ) : null}
        </div>
      ) : null}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-fg-muted">
          {t("directions")}
        </summary>
        <table className="mt-2 w-full text-xs">
          <thead className="text-left text-fg-faint">
            <tr>
              <th className="py-1 font-medium" />
              <th className="py-1 font-medium">{t("withTds")}</th>
              <th className="py-1 font-medium">{t("withEy")}</th>
            </tr>
          </thead>
          <tbody>
            {extraction.directions.map((d) => (
              <tr key={d.attribute.en} className="border-t border-line">
                <td className="py-1.5 text-fg">{L(d.attribute)}</td>
                <td className="py-1.5 text-fg-muted">{t(d.withTds)}</td>
                <td className="py-1.5 text-fg-muted">{t(d.withEy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-fg-muted">{t("facts")}</summary>
        <ul className="mt-2 space-y-2">
          {extraction.facts.map((f) => (
            <li
              key={f.source.url + f.text.en.slice(0, 20)}
              className="text-fg-muted"
            >
              {L(f.text)}{" "}
              <a
                className="text-fg-faint underline underline-offset-2"
                href={f.source.url}
                target="_blank"
                rel="noreferrer"
              >
                {f.source.title}
              </a>
            </li>
          ))}
        </ul>
      </details>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-fg-muted">
          {t("timeBands")}
        </summary>
        <ul className="mt-2 space-y-1 text-fg-muted">
          {extraction.timeBands
            .filter((b) => b.method === method)
            .map((b) => (
              <li key={b.label.en} className="tabular">
                {L(b.label)}: {fmt(b.seconds[0])}–{fmt(b.seconds[1])}{" "}
                <a
                  className="text-fg-faint underline underline-offset-2"
                  href={b.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {b.source.title}
                </a>
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function ChartSvg({
  extraction,
  slope,
  point,
  L,
}: {
  extraction: Extraction;
  /** TDS per EY point for this ratio and brew family (the ratio diagonal) */
  slope: number;
  point: { tds: number; ey: number } | null;
  L: (t: { en: string; "pt-BR": string }) => string;
}) {
  const W = 320;
  const H = 220;
  const P = { l: 38, r: 10, t: 10, b: 28 };
  const [eyLo, eyHi] = extraction.chart.eyAxis;
  const [tdsLo, tdsHi] = extraction.chart.tdsAxis;
  const x = (ey: number) =>
    P.l + ((ey - eyLo) / (eyHi - eyLo)) * (W - P.l - P.r);
  const y = (tds: number) =>
    H - P.b - ((tds - tdsLo) / (tdsHi - tdsLo)) * (H - P.t - P.b);
  const sca = extraction.chart.sca;

  const diag = [eyLo, eyHi].map((ey) => ({ ey, tds: ey * slope }));

  const cornerLabel = (id: string) => {
    const c = extraction.corners.find((k) => k.id === id);
    return c ? L(c.attributes[0]) : "";
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 w-full"
      role="img"
      aria-label="Brewing control chart"
    >
      <title>Brewing control chart</title>
      {/* SCA box */}
      <rect
        x={x(sca.ey[0])}
        y={y(sca.tds[1])}
        width={x(sca.ey[1]) - x(sca.ey[0])}
        height={y(sca.tds[0]) - y(sca.tds[1])}
        fill="oklch(1 0 0 / 0.08)"
        stroke="oklch(1 0 0 / 0.25)"
        rx="3"
      />
      <text
        x={(x(sca.ey[0]) + x(sca.ey[1])) / 2}
        y={(y(sca.tds[0]) + y(sca.tds[1])) / 2 + 3}
        textAnchor="middle"
        fontSize="7"
        fill="var(--color-fg-muted)"
      >
        SCA
      </text>
      {/* corners */}
      <text
        x={x(eyLo) + 4}
        y={y(tdsHi) + 9}
        fontSize="7"
        fill="var(--color-fg-faint)"
      >
        {cornerLabel("high-tds-low-ey")}
      </text>
      <text
        x={x(eyHi) - 4}
        y={y(tdsHi) + 9}
        fontSize="7"
        textAnchor="end"
        fill="var(--color-fg-faint)"
      >
        {cornerLabel("high-tds-high-ey")}
      </text>
      <text
        x={x(eyLo) + 4}
        y={y(tdsLo) - 4}
        fontSize="7"
        fill="var(--color-fg-faint)"
      >
        {cornerLabel("low-tds-low-ey")}
      </text>
      <text
        x={x(eyHi) - 4}
        y={y(tdsLo) - 4}
        fontSize="7"
        textAnchor="end"
        fill="var(--color-fg-faint)"
      >
        {cornerLabel("low-tds-high-ey")}
      </text>
      {/* ratio diagonal */}
      <line
        x1={x(diag[0].ey)}
        y1={y(Math.min(tdsHi, Math.max(tdsLo, diag[0].tds)))}
        x2={x(diag[1].ey)}
        y2={y(Math.min(tdsHi, Math.max(tdsLo, diag[1].tds)))}
        stroke="var(--color-accent)"
        strokeOpacity="0.6"
        strokeDasharray="3 3"
      />
      {/* axes */}
      <line
        x1={P.l}
        y1={H - P.b}
        x2={W - P.r}
        y2={H - P.b}
        stroke="var(--color-line-strong)"
      />
      <line
        x1={P.l}
        y1={P.t}
        x2={P.l}
        y2={H - P.b}
        stroke="var(--color-line-strong)"
      />
      {[14, 16, 18, 20, 22, 24, 26].map((v) => (
        <text
          key={v}
          x={x(v)}
          y={H - P.b + 12}
          fontSize="7"
          textAnchor="middle"
          fill="var(--color-fg-faint)"
        >
          {v}
        </text>
      ))}
      {[0.8, 1.0, 1.15, 1.35, 1.6].map((v) => (
        <text
          key={v}
          x={P.l - 4}
          y={y(v) + 2.5}
          fontSize="7"
          textAnchor="end"
          fill="var(--color-fg-faint)"
        >
          {v.toFixed(2)}
        </text>
      ))}
      <text
        x={W - P.r}
        y={H - 2}
        fontSize="7"
        textAnchor="end"
        fill="var(--color-fg-faint)"
      >
        EY %
      </text>
      <text x={4} y={P.t + 6} fontSize="7" fill="var(--color-fg-faint)">
        TDS %
      </text>
      {/* point */}
      {point ? (
        <circle
          cx={x(Math.min(eyHi, Math.max(eyLo, point.ey)))}
          cy={y(Math.min(tdsHi, Math.max(tdsLo, point.tds)))}
          r="5"
          fill="var(--color-accent)"
          stroke="var(--color-bg)"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}
