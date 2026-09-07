import { describe, expect, it } from "vitest";
import { loadGrinders, loadMicrons } from "../data";
import type { Grinder } from "../schema";
import { formatSetting, gridToSetting } from "./grind";

const grinders = loadGrinders();
const microns = loadMicrons().bands;
const byId = (id: string) => {
  const g = grinders.find((x) => x.id === id);
  if (!g) throw new Error(`missing grinder ${id}`);
  return g;
};
const ok = (s: ReturnType<typeof gridToSetting>) => {
  if (s.kind !== "ok") throw new Error(`expected ok, got ${JSON.stringify(s)}`);
  return s;
};

describe("gridToSetting", () => {
  it("Comandante V60: pos 0 and 1 hit the official band edges 18 and 35", () => {
    const g = byId("comandante-c40");
    expect(ok(gridToSetting(g, "v60", 0))).toMatchObject({
      value: 18,
      basis: "official",
      tolerance: 1,
    });
    expect(ok(gridToSetting(g, "v60", 1))).toMatchObject({ value: 35 });
    expect(ok(gridToSetting(g, "v60", 0.35)).value).toBe(24);
  });

  it("Timemore C3S Pro V60 at pos 0.35 lands inside 13–16 and flags nothing", () => {
    const s = ok(gridToSetting(byId("timemore-c3s-pro"), "v60", 0.35));
    expect(s.value).toBe(14);
    expect(s.unsafe).toBe(false);
    expect(s.outOfRange).toBe(false);
    expect(s.text).toBe("14 clicks");
  });

  it("Timemore below 6 clicks is unsafe", () => {
    const s = ok(gridToSetting(byId("timemore-c3s-pro"), "turkish", 0));
    expect(s.unsafe).toBe(true);
  });

  it("per-user offset shifts value and band", () => {
    const g = byId("comandante-c40");
    const s = ok(gridToSetting(g, "v60", 0.35, { offset: 3 }));
    expect(s.value).toBe(27);
    expect(s.band).toEqual([21, 38]);
  });

  it("falls back to the Honest Coffee Guide linear model when no band exists", () => {
    const g: Grinder = {
      ...byId("comandante-c40"),
      id: "test-no-bands",
      bands: {
        v60: {
          community: [1, 2],
          source: { url: "https://x.test", title: "t", kind: "community" },
        },
      },
      hcg: { micronRange: [0, 1000], ticks: 40 },
    };
    const s = ok(gridToSetting(g, "chemex", 0.5, { microns }));
    expect(s.basis).toBe("estimated");
    // chemex 600–900 µm on a 0–1000 µm, 40-tick axis → 24–36 → mid 30
    expect(s.value).toBe(30);
  });

  it("returns unknown when nothing is known", () => {
    const g: Grinder = { ...byId("comandante-c40"), bands: {}, hcg: undefined };
    expect(gridToSetting(g, "v60", 0.5)).toEqual({
      kind: "unknown",
      reason: "no-band",
    });
  });

  it("refuses espresso on a grinder that cannot do it", () => {
    const g: Grinder = { ...byId("comandante-c40"), espressoCapable: false };
    expect(gridToSetting(g, "espresso", 0.5)).toEqual({
      kind: "unknown",
      reason: "not-capable",
    });
  });

  it("is monotone in pos for every grinder and band", () => {
    for (const g of grinders) {
      for (const band of Object.keys(g.bands) as (keyof typeof g.bands)[]) {
        let prev = -Infinity;
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
          const s = gridToSetting(g, band, p);
          if (s.kind !== "ok") continue;
          expect(s.value, `${g.id} ${band} pos ${p}`).toBeGreaterThanOrEqual(
            prev,
          );
          prev = s.value;
        }
      }
    }
  });
});

describe("formatSetting", () => {
  const base = byId("comandante-c40");
  it("rot.num.tick", () => {
    const g: Grinder = {
      ...base,
      notation: "rot.num.tick",
      clicksPerRotation: 100,
      clicksPerNumber: 10,
    };
    expect(formatSetting(g, 85)).toEqual({
      text: "0.8.5",
      detail: "85 clicks from zero",
    });
    expect(formatSetting(g, 123).text).toBe("1.2.3");
  });
  it("dial.sub with 3 steps per number starting at 1", () => {
    const g: Grinder = {
      ...base,
      notation: "dial.sub",
      clicksPerNumber: 3,
      dialStart: 1,
    };
    expect(formatSetting(g, 0).text).toBe("1");
    expect(formatSetting(g, 13).text).toBe("5.1");
    expect(formatSetting(g, 12).text).toBe("5");
  });
  it("marks and rotations", () => {
    expect(formatSetting({ ...base, notation: "marks" }, 42).text).toBe(
      "mark 42",
    );
    expect(formatSetting({ ...base, notation: "marks" }, 42.5).text).toBe(
      "mark 42.5",
    );
    const eureka: Grinder = {
      ...base,
      notation: "rotations",
      clicksPerRotation: 10,
    };
    expect(formatSetting(eureka, 14).text).toBe("1 turn + 4");
    expect(formatSetting(eureka, 4.5).text).toBe("4.5");
  });
  it("labels", () => {
    const g: Grinder = { ...base, notation: "labels", labels: ["A", "B", "C"] };
    expect(formatSetting(g, 1).text).toBe("B");
  });
});
