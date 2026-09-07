import { describe, expect, it } from "vitest";
import { loadRecipes } from "../data";
import {
  buildSchedule,
  DoseOutOfRangeError,
  fillStepText,
  formatClock,
} from "./schedule";

const recipes = loadRecipes();
const byId = (id: string) => {
  const r = recipes.find((x) => x.id === id);
  if (!r) throw new Error(`missing recipe ${id}`);
  return r;
};

describe("buildSchedule", () => {
  it("Hoffmann Ultimate at 30 g: 60 g bloom, 300 g by 1:15, 500 g by 1:45, 3:30 total", () => {
    const s = buildSchedule(byId("v60-hoffmann-ultimate"), 30);
    expect(s.water).toBe(500);
    const bloom = s.steps.find((x) => x.action === "bloom")!;
    expect(bloom.cumulative).toBe(60);
    const pours = s.steps.filter((x) => x.action === "pour");
    expect(pours[0]).toMatchObject({
      at: 45,
      until: 75,
      cumulative: 300,
      added: 240,
    });
    expect(pours[1]).toMatchObject({
      at: 75,
      until: 105,
      cumulative: 500,
      added: 200,
    });
    expect(s.totalSeconds).toBe(210);
  });

  it("Hoffmann Ultimate scaled to 20 g keeps the shares", () => {
    const s = buildSchedule(byId("v60-hoffmann-ultimate"), 20);
    expect(s.water).toBe(333);
    expect(s.steps.find((x) => x.action === "bloom")!.cumulative).toBe(40);
    expect(s.steps.filter((x) => x.action === "pour")[0].cumulative).toBe(200);
  });

  it("rejects a dose below the recipe minimum", () => {
    expect(() => buildSchedule(byId("v60-hoffmann-ultimate"), 10)).toThrow(
      DoseOutOfRangeError,
    );
  });

  it("Hoffmann AeroPress at 11 g pours 200 g in one go", () => {
    const s = buildSchedule(byId("aeropress-hoffmann-ultimate"), 11);
    expect(s.water).toBe(200);
    const press = s.steps.find((x) => x.action === "press")!;
    expect(press.at).toBe(150);
    expect(press.durationSeconds).toBe(30);
  });

  it("fills placeholders", () => {
    const s = buildSchedule(byId("v60-hoffmann-ultimate"), 30);
    const pour = s.steps.filter((x) => x.action === "pour")[0];
    expect(
      fillStepText("to {water} g (+{add}) of {total} for {dose} g", pour, 30),
    ).toBe("to 300 g (+240) of 500 for 30 g");
  });

  it("formats the clock", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(210)).toBe("3:30");
  });
});
