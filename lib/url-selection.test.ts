import { describe, expect, it } from "vitest";
import { loadGrinders, loadRecipes } from "./data";
import { EMPTY_SELECTION } from "./machine";
import { sanitizeSelection } from "./url-selection";

const catalog = { recipes: loadRecipes(), grinders: loadGrinders() };

describe("sanitizeSelection", () => {
  it("drops a recipe that belongs to another method, with its dose", () => {
    const s = sanitizeSelection(
      {
        ...EMPTY_SELECTION,
        method: "v60",
        recipeId: "aeropress-wendelboe",
        dose: 14,
      },
      catalog,
    );
    expect(s.method).toBe("v60");
    expect(s.recipeId).toBeUndefined();
    expect(s.dose).toBeUndefined();
  });

  it("fills the method from the recipe when the link has none", () => {
    const s = sanitizeSelection(
      { ...EMPTY_SELECTION, recipeId: "aeropress-wendelboe" },
      catalog,
    );
    expect(s.method).toBe("aeropress");
  });

  it("drops unknown recipe and grinder ids", () => {
    const s = sanitizeSelection(
      {
        ...EMPTY_SELECTION,
        method: "v60",
        recipeId: "nope",
        grinderId: "nope",
        dose: 20,
      },
      catalog,
    );
    expect(s.recipeId).toBeUndefined();
    expect(s.grinderId).toBeUndefined();
    expect(s.dose).toBeUndefined();
  });
});
