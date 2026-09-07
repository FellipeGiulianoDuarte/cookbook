import type { Extraction } from "../schema";

/*
  Brewing control chart arithmetic. Only mass balance and published ranges.
  Nothing here predicts extraction from grind, temperature or pours: no published
  data supports such a prediction for pour-over.

  Sources: Ristenpart & Kuhl, The Design of Coffee (2021) and Guinard et al. 2023 for the
  percolation form with liquid retained ratio (LRR); Gagné (Coffee ad Astra, 2019) for the
  beverage-mass form and the immersion form.
*/

export type Family = "percolation" | "immersion";

/** EY from a TDS reading and the weighed beverage. EY = TDS × beverage / dose. */
export function eyFromBeverage(
  tdsPercent: number,
  beverageGrams: number,
  doseGrams: number,
) {
  return round2((tdsPercent * beverageGrams) / doseGrams);
}

/**
 * EY from a TDS reading without weighing the cup.
 * Percolation: EY = TDS/(1 − TDS) × (water/dose − LRR).
 * Immersion (AeroPress, French press): EY = TDS × (water + dose) / dose.
 */
export function eyFromWater(
  tdsPercent: number,
  waterGrams: number,
  doseGrams: number,
  family: Family,
  lrr: number,
) {
  const c = tdsPercent / 100;
  if (family === "immersion")
    return round2(tdsPercent * ((waterGrams + doseGrams) / doseGrams));
  return round2((c / (1 - c)) * (waterGrams / doseGrams - lrr) * 100);
}

/**
 * Refined percolation form (Gagné 2019) using the concentration of the last drops.
 * E = (C_bev − C_last)/(1 − C_last) × B/D + C_last/(1 − C_last) × (W/D − f_abs)
 */
export function eyRefined(
  tdsPercent: number,
  lastDropTdsPercent: number,
  beverageGrams: number,
  waterGrams: number,
  doseGrams: number,
  absorbedRatio = 1.0,
) {
  const c = tdsPercent / 100;
  const cl = lastDropTdsPercent / 100;
  const e =
    ((c - cl) / (1 - cl)) * (beverageGrams / doseGrams) +
    (cl / (1 - cl)) * (waterGrams / doseGrams - absorbedRatio);
  return round2(e * 100);
}

/** TDS implied by an EY at a ratio (percolation). TDS ≈ EY × dose / (water − LRR × dose). */
export function tdsFromEy(
  eyPercent: number,
  waterGrams: number,
  doseGrams: number,
  lrr: number,
) {
  return round2((eyPercent * doseGrams) / (waterGrams - lrr * doseGrams));
}

/** The TDS window implied by an EY band at this ratio. Never a single value. */
export function tdsWindow(
  eyBand: [number, number],
  waterGrams: number,
  doseGrams: number,
  family: Family,
  lrr: number,
): [number, number] {
  if (family === "immersion") {
    const f = doseGrams / (waterGrams + doseGrams);
    return [round2(eyBand[0] * f), round2(eyBand[1] * f)];
  }
  return [
    tdsFromEy(eyBand[0], waterGrams, doseGrams, lrr),
    tdsFromEy(eyBand[1], waterGrams, doseGrams, lrr),
  ];
}

export interface ZoneResult {
  insideSca: boolean;
  tds: "low" | "in" | "high";
  ey: "low" | "in" | "high";
  corner: Extraction["corners"][number] | null;
  directions: Extraction["directions"];
}

/** Where a measured point sits on the chart, and what the UC Davis studies say moves there. */
export function zoneFor(tds: number, ey: number, x: Extraction): ZoneResult {
  const [tLo, tHi] = x.chart.sca.tds;
  const [eLo, eHi] = x.chart.sca.ey;
  const t = tds < tLo ? "low" : tds > tHi ? "high" : "in";
  const e = ey < eLo ? "low" : ey > eHi ? "high" : "in";
  const insideSca = t === "in" && e === "in";
  // corners are defined for high/low; when inside on one axis, use the nearer half
  const tHalf = tds < (tLo + tHi) / 2 ? "low" : "high";
  const eHalf = ey < (eLo + eHi) / 2 ? "low" : "high";
  const corner = insideSca
    ? null
    : (x.corners.find(
        (c) =>
          c.tds === (t === "in" ? tHalf : t) &&
          c.ey === (e === "in" ? eHalf : e),
      ) ?? null);
  return { insideSca, tds: t, ey: e, corner, directions: x.directions };
}

export function ratioGPerL(doseGrams: number, waterGrams: number) {
  return round1((doseGrams / waterGrams) * 1000);
}

export type RangeCheck = "below" | "in" | "above";
export function checkRange(v: number, [lo, hi]: [number, number]): RangeCheck {
  return v < lo ? "below" : v > hi ? "above" : "in";
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}
function round1(v: number) {
  return Math.round(v * 10) / 10;
}
