"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { lathe, tube } from "./shapes";

const FLUTES = Array.from({ length: 64 }, (_, i) => (i / 64) * Math.PI * 2);

export function Grinder({
  ticks,
  value,
  spin,
}: {
  ticks: number;
  value: number;
  spin: boolean;
}) {
  const ring = useRef<THREE.Group>(null);
  const crank = useRef<THREE.Group>(null);
  const cur = useRef(value);
  const count = Math.min(60, Math.max(6, Math.round(ticks)));
  const marks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        major: i % 5 === 0,
      })),
    [count],
  );
  const body = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.285, 0],
        [0.315, 0.025],
        [0.32, 0.12],
        [0.32, 1.6],
        [0.31, 1.65],
        [0.285, 1.67],
        [0, 1.67],
      ]),
    [],
  );
  const arm = useMemo(
    () =>
      tube(
        [
          [0, 0.045, 0],
          [0.17, 0.05, 0],
          [0.34, 0.13, 0],
          [0.64, 0.14, 0],
        ],
        0.025,
      ),
    [],
  );
  useFrame((_, dt) => {
    cur.current = THREE.MathUtils.damp(cur.current, value, 8, dt);
    if (ring.current)
      ring.current.rotation.y =
        (-cur.current / Math.max(1, ticks)) * Math.PI * 2;
    if (crank.current && spin) crank.current.rotation.y += dt * 0.35;
  });
  return (
    <group position={[0, -1.3, 0]} rotation={[0, -0.45, 0]}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial
          color="#6c7778"
          metalness={0.8}
          roughness={0.33}
        />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.323, 0.323, 0.016, 96]} />
        <meshStandardMaterial color="#1f292b" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.324, 0.324, 0.84, 96]} />
        <meshStandardMaterial
          color="#344043"
          metalness={0.6}
          roughness={0.42}
        />
      </mesh>
      {FLUTES.map((angle) => (
        <mesh
          key={angle}
          position={[Math.sin(angle) * 0.325, 1.08, Math.cos(angle) * 0.325]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.008, 0.79, 0.006]} />
          <meshStandardMaterial
            color="#829091"
            metalness={0.75}
            roughness={0.4}
          />
        </mesh>
      ))}
      <group ref={ring} position={[0, 0.55, 0]}>
        <mesh>
          <cylinderGeometry args={[0.329, 0.329, 0.16, 96]} />
          <meshStandardMaterial
            color="#283235"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        {marks.map(({ angle, major }) => (
          <mesh
            key={angle}
            position={[Math.sin(angle) * 0.331, 0.02, Math.cos(angle) * 0.331]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.007, major ? 0.065 : 0.03, 0.005]} />
            <meshStandardMaterial color="#e6dac4" roughness={0.6} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.68, 0.33]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.016, 0.036, 3]} />
        <meshStandardMaterial color="#d6a467" metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.675, 0]} castShadow>
        <cylinderGeometry args={[0.318, 0.32, 0.045, 96]} />
        <meshStandardMaterial color="#222d30" metalness={0.5} roughness={0.3} />
      </mesh>
      <group ref={crank} position={[0, 1.73, 0]}>
        <mesh>
          <cylinderGeometry args={[0.062, 0.065, 0.09, 32]} />
          <meshStandardMaterial
            color="#bac2c1"
            metalness={0.95}
            roughness={0.22}
          />
        </mesh>
        <mesh geometry={arm} castShadow>
          <meshStandardMaterial
            color="#c2c9c8"
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.64, 0.23, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 24]} />
          <meshStandardMaterial
            color="#adb5b5"
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.64, 0.33, 0]} scale={[0.14, 0.16, 0.13]} castShadow>
          <sphereGeometry args={[1, 40, 24]} />
          <meshPhysicalMaterial
            color="#745039"
            roughness={0.5}
            clearcoat={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}
