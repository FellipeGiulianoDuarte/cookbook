"use client";

import { useMemo } from "react";
import { lathe, tube } from "./shapes";

export function Cup() {
  const body = useMemo(
    () =>
      lathe([
        [0, 0.015],
        [0.31, 0.015],
        [0.35, 0.04],
        [0.39, 0.6],
        [0.39, 0.68],
        [0.375, 0.7],
        [0.35, 0.7],
        [0.34, 0.67],
        [0.3, 0.1],
        [0, 0.1],
      ]),
    [],
  );
  const handle = useMemo(
    () =>
      tube(
        [
          [0.37, 0.55, 0],
          [0.57, 0.56, 0],
          [0.65, 0.4, 0],
          [0.56, 0.22, 0],
          [0.36, 0.2, 0],
        ],
        0.047,
      ),
    [],
  );
  return (
    <group>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color="#ded7cb" roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh geometry={handle} castShadow>
        <meshPhysicalMaterial color="#ded7cb" roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.35, 0.335, 0.045, 64]} />
        <meshStandardMaterial color="#ad9d87" roughness={0.8} />
      </mesh>
    </group>
  );
}
