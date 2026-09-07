"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";

/*
  Hand grinder: body, hopper, crank, and a dial ring with `ticks` marks per rotation.
  The ring turns to `value` ticks from zero; the crank idles slowly.
*/
export function Grinder({
  ticks,
  value,
  spin,
}: {
  ticks: number;
  value: number;
  spin: boolean;
}) {
  const shownTicks = Math.min(60, Math.max(6, Math.round(ticks)));
  const ring = useRef<THREE.Group>(null);
  const crank = useRef<THREE.Group>(null);
  const marks = useRef<THREE.InstancedMesh>(null);
  const cur = useRef(0);

  const markGeo = useMemo(() => new THREE.BoxGeometry(0.012, 0.05, 0.05), []);

  useFrame((_, dt) => {
    if (marks.current && !marks.current.userData.placed) {
      const d = new THREE.Object3D();
      for (let i = 0; i < shownTicks; i++) {
        const a = (i / shownTicks) * Math.PI * 2;
        d.position.set(Math.cos(a) * 0.47, 0, Math.sin(a) * 0.47);
        d.rotation.set(0, -a, 0);
        d.updateMatrix();
        marks.current.setMatrixAt(i, d.matrix);
      }
      marks.current.instanceMatrix.needsUpdate = true;
      marks.current.userData.placed = true;
    }
    // ring turns to the target value; one full turn per `ticks`
    cur.current = THREE.MathUtils.lerp(cur.current, value, 0.08);
    if (ring.current)
      ring.current.rotation.y = -(cur.current / ticks) * Math.PI * 2;
    if (crank.current && spin) crank.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[0, -0.9, 0]}>
      {/* catch cup */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.7, 48]} />
        <meshStandardMaterial
          color={COLORS.plasticGrey}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* dial ring at the base of the burr, with marks */}
      <group ref={ring} position={[0, 0.74, 0]}>
        <mesh>
          <cylinderGeometry args={[0.46, 0.46, 0.1, 48]} />
          <meshStandardMaterial
            color={COLORS.plasticDark}
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
        <instancedMesh
          ref={marks}
          args={[markGeo, undefined, shownTicks]}
          position={[0, 0.02, 0]}
        >
          <meshStandardMaterial color={COLORS.crema} roughness={0.4} />
        </instancedMesh>
      </group>
      {/* fixed pointer */}
      <mesh position={[0.5, 0.74, 0]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial
          color={COLORS.copper}
          emissive={COLORS.copper}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* body */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.45, 0.46, 1.2, 48]} />
        <meshStandardMaterial
          color={COLORS.plasticGrey}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* knurl band */}
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.462, 0.462, 0.28, 64]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.8} />
      </mesh>
      {/* lid */}
      <mesh position={[0, 2.03, 0]}>
        <cylinderGeometry args={[0.46, 0.45, 0.06, 48]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
      </mesh>
      {/* crank */}
      <group ref={crank} position={[0, 2.08, 0]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 24]} />
          <meshStandardMaterial
            color={COLORS.steel}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.3, 0.07, 0]}>
          <boxGeometry args={[0.62, 0.03, 0.08]} />
          <meshStandardMaterial
            color={COLORS.steel}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.6, 0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.26, 24]} />
          <meshStandardMaterial color={COLORS.plasticDark} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
