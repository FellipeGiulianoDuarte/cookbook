import { describe, expect, it } from "vitest";
import { loadCatalog } from "./data";
import { derive } from "./derive";
import { EMPTY_SELECTION } from "./machine";

const { recipes, grinders, adjustments, microns, extraction } = loadCatalog();
const catalog = { recipes, grinders, adjustments, microns, extraction };
const setting = (recipeId: string, grinderId: string) => {
  const d = derive(catalog, { ...EMPTY_SELECTION, recipeId, grinderId });
  if (d.setting?.kind !== "ok")
    throw new Error(`no setting for ${recipeId} on ${grinderId}`);
  return d.setting;
};

describe("derive: recipe grind → grinder setting", () => {
  it("Kasuya 4:6 (800 µm, coarse edge of the V60 window) is coarse on every grinder", () => {
    // Japanese Coffee Gear: 28–30 clicks on a Comandante C40 for Kasuya's grind.
    expect(setting("v60-kasuya-46", "comandante-c40").value).toBe(28);
    // Timemore's printed guide stops at 16 (medium); the chart's coarse edge is 18.
    expect(setting("v60-kasuya-46", "timemore-c3s-pro").value).toBe(18);
  });

  it("Hoffmann Ultimate V60 stays at 24 on the Comandante and is finer than Kasuya on the C3S Pro", () => {
    expect(setting("v60-hoffmann-ultimate", "comandante-c40").value).toBe(24);
    expect(
      setting("v60-hoffmann-ultimate", "timemore-c3s-pro").value,
    ).toBeLessThan(setting("v60-kasuya-46", "timemore-c3s-pro").value);
  });

  it("a stated particle size overrides the hand-placed position (Onyx 550 µm = middle of 400–700)", () => {
    const d = derive(catalog, {
      ...EMPTY_SELECTION,
      recipeId: "v60-onyx-guide",
    });
    expect(d.grindPos).toBeCloseTo(0.5, 5);
  });
});
