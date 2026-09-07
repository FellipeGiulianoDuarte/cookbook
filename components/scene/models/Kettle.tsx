"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/*
  Hario Buono kettle: bulbous ribbed stainless body, gooseneck spout low on the body,
  black knob and handle. Local origin = kettle bottom. When `pouring` it moves above the
  brewer and tilts; otherwise it rests out of frame.
*/

const BODY: [number, number][] = [
  [0, 0],
  [0.62, 0],
  [0.7, 0.04],
  [0.73, 0.14],
  [0.7, 0.22],
  [0.75, 0.32],
  [0.71, 0.4],
  [0.76, 0.5],
  [0.7, 0.6],
  [0.6, 0.74],
  [0.44, 0.84],
  [0.36, 0.88],
  [0.36, 0.92],
  [0.3, 0.98],
  [0.14, 1.03],
  [0, 1.04],
];

export function Kettle({
  pouring,
  target,
  spoutHeight = 1.9,
}: {
  pouring: boolean;
  /** where the brewer stands; the kettle pours above it */
  target: THREE.Vector3;
  spoutHeight?: number;
}) {
  const body = useMemo(() => {
    const curve = new THREE.SplineCurve(
      BODY.map(([r, y]) => new THREE.Vector2(r, y)),
    );
    return new THREE.LatheGeometry(curve.getPoints(72), 96);
  }, []);

  const spout = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, 0.22, 0),
      new THREE.Vector3(0.98, 0.34, 0),
      new THREE.Vector3(1.18, 0.7, 0),
      new THREE.Vector3(1.22, 1.05, 0),
      new THREE.Vector3(1.34, 1.2, 0),
      new THREE.Vector3(1.42, 1.12, 0),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.055, 16, false);
  }, []);

  const handle = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 1.0, 0),
      new THREE.Vector3(-0.7, 1.15, 0),
      new THREE.Vector3(-1.0, 0.9, 0),
      new THREE.Vector3(-0.92, 0.55, 0),
      new THREE.Vector3(-0.66, 0.42, 0),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.06, 14, false);
  }, []);

  const ref = useRef<THREE.Group>(null);
  const rest = useMemo(
    () => ({ pos: new THREE.Vector3(4.8, -1.3, -2.4), rot: 0 }),
    [],
  );
  const pour = useMemo(
    () => ({
      pos: new THREE.Vector3(
        target.x - 1.25,
        target.y + spoutHeight,
        target.z + 0.1,
      ),
      rot: -0.6,
    }),
    [target, spoutHeight],
  );

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = pouring ? pour : rest;
    g.position.lerp(t.pos, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, t.rot, 0.06);
  });

  const steel = (
    <meshStandardMaterial color="#d6d3cd" metalness={1} roughness={0.25} />
  );
  const black = <meshStandardMaterial color="#17130f" roughness={0.45} />;

  return (
    <group ref={ref} position={rest.pos.toArray()}>
      <mesh geometry={body} castShadow>
        {steel}
      </mesh>
      <mesh geometry={spout} castShadow>
        {steel}
      </mesh>
      <mesh geometry={handle} castShadow>
        {black}
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.09, 0.07, 0.12, 32]} />
        {black}
      </mesh>
    </group>
  );
}
