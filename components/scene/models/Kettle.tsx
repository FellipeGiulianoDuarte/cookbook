"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";

/*
  Gooseneck kettle: lathe body, tube spout along a curve, a handle. When `pouring` it
  moves above the brewer and tilts; otherwise it rests to the side.
*/
export function Kettle({
  pouring,
  target,
  spoutHeight = 1.75,
}: {
  pouring: boolean;
  /** where the brewer stands; the kettle pours above it */
  target: THREE.Vector3;
  spoutHeight?: number;
}) {
  const body = useMemo(() => {
    // Stagg-style profile: wide flat base, soft shoulder, narrow neck, domed lid.
    const raw: [number, number][] = [
      [0, 0],
      [0.6, 0],
      [0.66, 0.06],
      [0.68, 0.22],
      [0.66, 0.42],
      [0.6, 0.6],
      [0.5, 0.76],
      [0.4, 0.88],
      [0.34, 0.95],
      [0.33, 1.0],
      [0.3, 1.04],
      [0.2, 1.08],
      [0.09, 1.1],
      [0, 1.1],
    ];
    const curve = new THREE.SplineCurve(
      raw.map(([x, y]) => new THREE.Vector2(x, y)),
    );
    return new THREE.LatheGeometry(curve.getPoints(64), 96);
  }, []);

  const spout = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, 0.28, 0),
      new THREE.Vector3(0.95, 0.42, 0),
      new THREE.Vector3(1.12, 0.85, 0),
      new THREE.Vector3(1.16, 1.2, 0),
      new THREE.Vector3(1.3, 1.34, 0),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.05, 16, false);
  }, []);

  const ref = useRef<THREE.Group>(null);
  const rest = useMemo(
    () => ({ pos: new THREE.Vector3(4.6, -1.3, -2.2), rot: 0 }),
    [],
  );
  const pour = useMemo(
    () => ({
      pos: new THREE.Vector3(
        target.x - 0.95,
        target.y + spoutHeight,
        target.z + 0.1,
      ),
      rot: -0.55,
    }),
    [target, spoutHeight],
  );

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const target = pouring ? pour : rest;
    g.position.lerp(target.pos, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, target.rot, 0.06);
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      pouring ? Math.PI : Math.PI * 0.85,
      0.06,
    );
  });

  return (
    <group
      ref={ref}
      position={rest.pos.toArray()}
      rotation={[0, Math.PI * 0.85, 0]}
    >
      <mesh geometry={body} castShadow>
        <meshStandardMaterial color="#d9d6d0" metalness={1} roughness={0.22} />
      </mesh>
      <mesh geometry={spout} castShadow>
        <meshStandardMaterial color="#d9d6d0" metalness={1} roughness={0.22} />
      </mesh>
      {/* lid knob */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.07, 24, 16]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
      </mesh>
      {/* handle */}
      <mesh position={[-0.55, 0.62, 0]} rotation={[0, 0, Math.PI / 2 + 0.25]}>
        <torusGeometry args={[0.42, 0.045, 12, 32, Math.PI]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
      </mesh>
    </group>
  );
}
