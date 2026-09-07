import { describe, expect, it } from "vitest";
import { loadCatalog } from "./data";
import { buildSchedule } from "./engine/schedule";

/*
  Data contract tests. Every JSON file must validate, carry sources, and be internally
  consistent. These run on every push; adding a file with a missing source fails CI.
*/

const catalog = loadCatalog();

describe("recipes", () => {
  it("has at least one recipe per launch method", () => {
    for (const m of ["v60", "aeropress"] as const) {
      expect(
        catalog.recipes.filter((r) => r.method === m).length,
      ).toBeGreaterThan(0);
    }
  });

  it.each(catalog.recipes.map((r) => [r.id, r] as const))(
    "%s is consistent",
    (_id, r) => {
      expect(r.dose.min).toBeLessThanOrEqual(r.dose.default);
      expect(r.dose.default).toBeLessThanOrEqual(r.dose.max);
      expect(r.source.url).toMatch(/^https?:\/\//);
      // times never go backwards
      for (let i = 1; i < r.steps.length; i++) {
        expect(r.steps[i].at).toBeGreaterThanOrEqual(r.steps[i - 1].at);
      }
      expect(r.steps[r.steps.length - 1].at).toBeLessThanOrEqual(
        r.totalSeconds,
      );
      // water is monotone and ends at the total
      const s = buildSchedule(r, r.dose.default);
      let prev = 0;
      for (const st of s.steps) {
        expect(st.cumulative).toBeGreaterThanOrEqual(prev);
        prev = st.cumulative;
      }
      expect(prev).toBe(s.water);
      // every step has both languages
      for (const st of r.steps) {
        expect(st.text.en.length).toBeGreaterThan(0);
        expect(st.text["pt-BR"].length).toBeGreaterThan(0);
      }
    },
  );
});

describe("grinders", () => {
  it("has the owner's grinder", () => {
    expect(catalog.grinders.some((g) => g.id === "timemore-c3s-pro")).toBe(
      true,
    );
  });

  it.each(catalog.grinders.map((g) => [g.id, g] as const))(
    "%s is consistent",
    (_id, g) => {
      expect(g.range[0]).toBeLessThan(g.range[1]);
      const bands = Object.entries(g.bands);
      expect(bands.length).toBeGreaterThan(0);
      for (const [name, b] of bands) {
        expect(b.official || b.community, `${name} needs a band`).toBeTruthy();
        for (const r of [b.official, b.community]) {
          if (!r) continue;
          expect(r[0], `${name} lo<=hi`).toBeLessThanOrEqual(r[1]);
        }
        expect(b.source.url).toMatch(/^https?:\/\//);
      }
      if (g.notation === "rot.num.tick") {
        expect(g.clicksPerRotation).toBeDefined();
        expect(g.clicksPerNumber).toBeDefined();
      }
      if (g.notation === "labels") expect(g.labels?.length).toBeGreaterThan(1);
      // espresso band present only when capable
      if (!g.espressoCapable)
        expect(g.bands.espresso?.official).toBeUndefined();
    },
  );
});

describe("adjustments, microns, extraction", () => {
  it("default roast table exists and covers all levels", () => {
    const t = catalog.adjustments.roastTemperature.find(
      (x) => x.id === catalog.adjustments.defaultRoastTable,
    );
    expect(t).toBeDefined();
    expect(Object.keys(t!.byRoast)).toHaveLength(5);
  });
  it("SCA box is the SCA box", () => {
    expect(catalog.extraction.chart.sca.tds).toEqual([1.15, 1.35]);
    expect(catalog.extraction.chart.sca.ey).toEqual([18, 22]);
  });
  it("micron bands are ordered", () => {
    for (const [lo, hi] of Object.values(catalog.microns.bands))
      expect(lo).toBeLessThan(hi);
  });
});
