"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";

/*
  Gooseneck kettle: lathe body, tube spout along a curve, a handle. When `pouring` it
  moves above the brewer and tilts; otherwise it rests to the side.
*/
export function Kettle({ pouring }: { pouring: boolean }) {
  const body = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.55, 0),
      new THREE.Vector2(0.62, 0.15),
      new THREE.Vector2(0.6, 0.6),
      new THREE.Vector2(0.5, 0.85),
      new THREE.Vector2(0.32, 0.95),
      new THREE.Vector2(0.3, 1.0),
      new THREE.Vector2(0, 1.0),
    ];
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  const spout = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.45, 0.35, 0),
      new THREE.Vector3(0.85, 0.5, 0),
      new THREE.Vector3(1.05, 0.95, 0),
      new THREE.Vector3(1.12, 1.25, 0),
      new THREE.Vector3(1.3, 1.3, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.045, 12, false);
  }, []);

  const ref = useRef<THREE.Group>(null);
  const rest = useMemo(
    () => ({ pos: new THREE.Vector3(4.6, -1.3, -2.2), rot: 0 }),
    [],
  );
  const pour = useMemo(
    () => ({ pos: new THREE.Vector3(0.9, 1.75, 0.1), rot: -0.55 }),
    [],
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
      <mesh geometry={body}>
        <meshStandardMaterial
          color={COLORS.steel}
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>
      <mesh geometry={spout}>
        <meshStandardMaterial
          color={COLORS.steel}
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>
      {/* lid knob */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
      </mesh>
      {/* handle */}
      <mesh position={[-0.7, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.045, 10, 24, Math.PI]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
      </mesh>
    </group>
  );
}
