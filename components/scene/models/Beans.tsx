"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const LIGHT = new THREE.Color("#aa7142");
const DARK = new THREE.Color("#3d2418");
const BEANS = [
  { p: [-0.34, 0, 0.13], angle: 0.4, size: 1 },
  { p: [0.29, 0, 0.21], angle: 1.8, size: 0.94 },
  { p: [-0.27, 0, -0.4], angle: 2.6, size: 0.92 },
  { p: [0.29, 0, -0.37], angle: 0.2, size: 1.04 },
  { p: [-0.78, 0, -0.13], angle: 1.4, size: 0.78 },
  { p: [0.79, 0, 0.02], angle: 2.3, size: 0.83 },
];

/** A recessed, curved seam in the surface itself, with deterministic roast variation. */
export function beanGeometry() {
  const geometry = new THREE.SphereGeometry(1, 64, 48);
  const positions = geometry.attributes.position;
  const colors: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const seam = Math.exp(-(((x - 0.13 * Math.sin(z * 3)) / 0.12) ** 2));
    const top = Math.max(0, y);
    const noise = Math.sin(x * 71 + z * 39) * Math.sin(y * 57 - z * 63);
    positions.setXYZ(
      i,
      x * 0.245 * (1 + z * 0.08),
      y * 0.16 - seam * top * 0.083 + noise * 0.003,
      z * 0.355,
    );
    const shade = 1 - seam * top * 0.63 + noise * 0.055;
    colors.push(shade, shade, shade);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function Beans({ roast, spin }: { roast: number; spin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(beanGeometry, []);
  const r = THREE.MathUtils.clamp(roast, 0, 1);
  const color = useMemo(() => LIGHT.clone().lerp(DARK, r), [r]);
  useFrame(({ clock }) => {
    if (group.current && spin)
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.1;
  });
  return (
    <group ref={group} position={[0, -1.3, 0]}>
      {BEANS.map((bean) => (
        <mesh
          key={bean.p.join(",")}
          geometry={geometry}
          castShadow
          position={[bean.p[0], 0.165 * bean.size, bean.p[2]]}
          rotation={[0, bean.angle, 0]}
          scale={bean.size}
        >
          <meshPhysicalMaterial
            color={color}
            vertexColors
            roughness={0.78 - r * 0.26}
            clearcoat={r * 0.24}
            clearcoatRoughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
