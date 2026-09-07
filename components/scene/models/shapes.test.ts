import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { KETTLE_TIP, kettlePourPosition, pressPose } from "./shapes";

describe("AeroPress assembly", () => {
  it("keeps the upright chamber on the cup while the seal travels down inside it", () => {
    const start = pressPose(false, 0);
    const end = pressPose(false, 1);
    expect(start.chamber).toBe(end.chamber);
    expect(start.cap).toBe(end.cap);
    expect(end.seal).toBeLessThan(start.seal);
    for (const pressed of [0, 0.25, 0.5, 0.75, 1]) {
      const p = pressPose(false, pressed);
      expect(p.seal).toBeGreaterThan(p.cap + 0.04);
      expect(p.seal).toBeLessThan(p.chamber + 1.13);
    }
  });
  it("keeps the inverted plunger on the floor as the chamber moves over it", () => {
    const start = pressPose(true, 0);
    const end = pressPose(true, 1);
    expect(start.seal).toBe(end.seal);
    expect(start.seal - 0.82 - 0.045 - 0.035).toBeCloseTo(0);
    expect(end.chamber).toBeLessThan(start.chamber);
    for (const pressed of [0, 0.25, 0.5, 0.75, 1]) {
      const p = pressPose(true, pressed);
      expect(p.chamber).toBeLessThan(p.seal);
      expect(p.cap).toBeGreaterThan(p.seal + 0.1);
    }
  });
  it("clamps out-of-range press progress", () => {
    expect(pressPose(false, -2)).toEqual(pressPose(false, 0));
    expect(pressPose(true, 2)).toEqual(pressPose(true, 1));
  });
});

describe("kettle pouring", () => {
  it("puts the tilted spout directly over each brewer rather than offset from the water", () => {
    for (const [x, height] of [
      [-1.15, 1.89],
      [1.15, 1.85],
      [1.15, 1.96],
    ]) {
      const target = new THREE.Vector3(x, -1.3, 0);
      const tilt = -0.6;
      const worldTip = KETTLE_TIP.clone()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt)
        .add(kettlePourPosition(target, height, tilt));
      expect(worldTip.x).toBeCloseTo(target.x);
      expect(worldTip.z).toBeCloseTo(target.z);
      expect(worldTip.y).toBeCloseTo(target.y + height + 0.65);
    }
  });
});
