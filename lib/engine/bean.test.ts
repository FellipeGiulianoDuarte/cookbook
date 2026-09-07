import { describe, expect, it } from "vitest";
import { loadAdjustments, loadRecipes } from "../data";
import { adjustForBean } from "./bean";

const adjustments = loadAdjustments();
const recipes = loadRecipes();
const byId = (id: string) => recipes.find((r) => r.id === id)!;

describe("adjustForBean", () => {
  it("uses the recipe's own roast table when present", () => {
    const a = adjustForBean(
      byId("v60-hoffmann-ultimate"),
      { roast: "light" },
      adjustments,
    );
    expect(a).toMatchObject({ tempC: 100, tempSource: "recipe" });
  });
  it("interpolates a missing level inside the recipe table", () => {
    const a = adjustForBean(
      byId("v60-hoffmann-ultimate"),
      { roast: "medium-dark" },
      adjustments,
    );
    expect(a.tempC).toBe(93); // between medium 96 and dark 90
  });
  it("falls back to the Philocoffea table when the recipe has none", () => {
    const r = {
      ...byId("v60-hoffmann-ultimate"),
      temperature: { default: 93 },
    };
    const a = adjustForBean(r, { roast: "dark" }, adjustments);
    expect(a).toMatchObject({
      tempC: 83,
      tempSource: "table",
      tempTableId: "philocoffea",
    });
  });
  it("washed has no suggestions; natural has community nudges, not applied", () => {
    const r = byId("v60-hoffmann-ultimate");
    expect(
      adjustForBean(r, { roast: "medium", process: "washed" }, adjustments)
        .suggestions,
    ).toBeNull();
    const nat = adjustForBean(
      r,
      { roast: "medium", process: "natural" },
      adjustments,
    );
    expect(nat.tempC).toBe(96); // unchanged
    expect(nat.suggestions).toMatchObject({
      tempDeltaC: -3,
      grindPosDelta: 0.1,
    });
  });
});
