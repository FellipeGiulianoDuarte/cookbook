"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/*
  A small pile of coffee beans. Each bean is a flattened sphere with a dark crease.
  Colour follows the roast level (0 light → 1 dark).
*/
const LIGHT = new THREE.Color("#b8834a");
const DARK = new THREE.Color("#2b1a11");

const BEANS = [
  { p: [0, 0, 0], r: [0.2, 0.4, 0.1] },
  { p: [0.55, 0.02, 0.15], r: [0.1, 1.9, 0.3] },
  { p: [-0.5, 0.02, 0.25], r: [0.3, 0.8, -0.2] },
  { p: [0.15, 0.03, -0.55], r: [0.4, 2.6, 0.1] },
  { p: [-0.3, 0.04, -0.4], r: [0.1, 1.2, 0.35] },
  { p: [0.45, 0.05, -0.35], r: [0.5, 0.2, -0.3] },
  { p: [-0.1, 0.32, -0.1], r: [1.4, 0.6, 0.3] },
  { p: [0.2, 0.33, 0.2], r: [1.2, 2.2, 0.4] },
] as const;

export function Beans({ roast, spin }: { roast: number; spin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const color = useMemo(
    () => LIGHT.clone().lerp(DARK, Math.min(1, Math.max(0, roast))),
    [roast],
  );
  useFrame((_, dt) => {
    if (group.current && spin) group.current.rotation.y += dt * 0.35;
  });
  return (
    <group ref={group} position={[0, -1.1, 0]}>
      {BEANS.map((b) => (
        <group
          key={b.p.join(",")}
          position={b.p as unknown as [number, number, number]}
          rotation={b.r as unknown as [number, number, number]}
        >
          <mesh scale={[0.36, 0.22, 0.26]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.55 - roast * 0.25}
              clearcoat={roast * 0.6}
              clearcoatRoughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]} scale={[0.02, 0.05, 0.2]}>
            <boxGeometry />
            <meshStandardMaterial color="#1b110b" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
