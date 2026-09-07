import { describe, expect, it } from "vitest";
import { loadExtraction } from "../data";
import {
  eyFromBeverage,
  eyFromWater,
  eyRefined,
  ratioGPerL,
  tdsWindow,
  zoneFor,
} from "./extraction";

const x = loadExtraction();

describe("extraction arithmetic", () => {
  it("Gagné's worked example: 22 g, 374 g water, 350 g beverage, TDS 1.42 % → 22.6 % simple", () => {
    expect(eyFromBeverage(1.42, 350, 22)).toBeCloseTo(22.59, 1);
  });
  it("refined form with last drops at 0.8 % → about 22.85 %", () => {
    expect(eyRefined(1.42, 0.8, 350, 374, 22, 1.0)).toBeCloseTo(22.85, 1);
  });
  it("percolation form from water and LRR 2.0 is close to the beverage form", () => {
    expect(eyFromWater(1.42, 374, 22, "percolation", 2.0)).toBeCloseTo(21.6, 0);
  });
  it("AeroPress immersion: 11 g, 200 g, TDS 1.20 % → 23.0 %", () => {
    expect(eyFromWater(1.2, 200, 11, "immersion", 2.0)).toBeCloseTo(23.02, 1);
  });
  it("TDS window at 60 g/L without a reading is a range, about 1.16–1.42 %", () => {
    const [lo, hi] = tdsWindow([18, 22], 250, 15, "percolation", 2.0);
    expect(lo).toBeCloseTo(1.23, 1);
    expect(hi).toBeCloseTo(1.5, 1);
    expect(lo).toBeLessThan(hi);
  });
  it("ratio in g/L", () => {
    expect(ratioGPerL(15, 250)).toBe(60);
  });
});

describe("zoneFor", () => {
  it("inside the SCA box", () => {
    const z = zoneFor(1.25, 20, x);
    expect(z.insideSca).toBe(true);
    expect(z.corner).toBeNull();
  });
  it("strong and under-extracted → acid/sour corner", () => {
    const z = zoneFor(1.5, 16, x);
    expect(z.insideSca).toBe(false);
    expect(z.corner?.id).toBe("high-tds-low-ey");
    expect(z.corner?.attributes[0].en).toContain("sour");
  });
  it("weak and over-extracted → black tea", () => {
    expect(zoneFor(1.0, 24, x).corner?.id).toBe("low-tds-high-ey");
  });
  it("no numeric taste score exists in the output", () => {
    const z = zoneFor(1.5, 24, x);
    for (const d of z.directions)
      expect(["up", "down", "flat"]).toContain(d.withTds);
  });
});
