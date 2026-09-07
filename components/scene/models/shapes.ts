import * as THREE from "three";

/** Closed wall profiles include the inner surface, so openings remain hollow. */
export function lathe(points: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

export function tube(points: [number, number, number][], radius: number) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    48,
    radius,
    12,
    false,
  );
}

/** World height of the seal, chamber and cap; all offsets share a floor origin. */
export function pressPose(inverted: boolean, pressed: number) {
  const p = THREE.MathUtils.clamp(pressed, 0, 1);
  const chamber = inverted ? 0.83 - p * 0.77 : 0.72;
  return {
    chamber,
    seal: inverted ? 0.9 : 1.62 - p * 0.77,
    cap: inverted ? chamber + 1.13 : chamber,
    bed: inverted ? 0.95 : chamber + 0.08,
  };
}

export const KETTLE_TIP = new THREE.Vector3(1.42, 1.12, 0);

/** Put the transformed spout exactly at the top of the falling water. */
export function kettlePourPosition(
  target: THREE.Vector3,
  height: number,
  tilt: number,
) {
  return new THREE.Vector3(target.x, target.y + height + 0.65, target.z).sub(
    KETTLE_TIP.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt),
  );
}
