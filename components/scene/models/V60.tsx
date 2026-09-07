"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";
import { Glass } from "./Glass";

/*
  Procedural V60: a 60° cone lathe with 24 ribs, a base ring, a coffee bed, the slurry
  whose level follows `fill`, a glass server underneath, and a pour stream when pouring.
  Dimensions in scene units (1 ≈ 8 cm).
*/

const TOP_Y = 1.13;
const SPOUT_Y = 0.2;
const TOP_R = 1.0;
const SPOUT_R = 0.17;
const RIBS = 20;

function radiusAt(y: number) {
  const t = (y - SPOUT_Y) / (TOP_Y - SPOUT_Y);
  return SPOUT_R + t * (TOP_R - SPOUT_R);
}

export function V60({
  fill,
  coffee,
  pouring,
  quality,
}: {
  fill: number;
  coffee: number;
  pouring: boolean;
  quality: "high" | "low";
}) {
  const cone = useMemo(() => {
    const pts = [
      new THREE.Vector2(SPOUT_R, SPOUT_Y),
      new THREE.Vector2(TOP_R, TOP_Y),
      new THREE.Vector2(TOP_R + 0.06, TOP_Y + 0.02),
      new THREE.Vector2(SPOUT_R + 0.05, SPOUT_Y),
    ];
    return new THREE.LatheGeometry(pts, 96);
  }, []);

  const ribs = useMemo(() => {
    const g = new THREE.BoxGeometry(0.03, TOP_Y - SPOUT_Y - 0.18, 0.045);
    return g;
  }, []);
  const ribsRef = useRef<THREE.InstancedMesh>(null);
  useMemo(() => {
    // placed once the ref exists (first frame)
  }, []);
  useFrame(() => {
    const m = ribsRef.current;
    if (!m || m.userData.placed) return;
    const dummy = new THREE.Object3D();
    const tilt = Math.atan((TOP_R - SPOUT_R) / (TOP_Y - SPOUT_Y));
    for (let i = 0; i < RIBS; i++) {
      const a = (i / RIBS) * Math.PI * 2;
      const midY = (TOP_Y + SPOUT_Y) / 2;
      const r = radiusAt(midY) - 0.03;
      dummy.position.set(Math.cos(a) * r, midY, Math.sin(a) * r);
      dummy.rotation.set(0, -a, 0);
      dummy.rotateZ(-tilt);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.userData.placed = true;
  });

  const bedH = coffee <= 0 ? 0.0001 : 0.12 + Math.min(1, coffee) * 0.3;

  // Slurry: a truncated cone whose top follows the fill level (quantised to keep geometry stable).
  const level = Math.round(Math.max(0, Math.min(1, fill)) * 40) / 40;
  const slurry = useMemo(() => {
    if (level <= 0) return null;
    const base = SPOUT_Y + bedH - 0.02;
    const topY = Math.max(base + 0.02, base + level * (TOP_Y - base - 0.15));
    const pts = [
      new THREE.Vector2(0, base),
      new THREE.Vector2(radiusAt(base) - 0.03, base),
      new THREE.Vector2(radiusAt(topY) - 0.03, topY),
      new THREE.Vector2(0, topY),
    ];
    return new THREE.LatheGeometry(pts, 72);
  }, [level, bedH]);

  // Server: glass cylinder; its liquid rises with fill.
  const serverH = 1.1;
  const serverFill = Math.max(0.02, level * (serverH - 0.15));

  const stream = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!stream.current) return;
    const target = pouring ? 1 : 0;
    const s = stream.current.scale;
    s.x = THREE.MathUtils.lerp(s.x, target, 0.15);
    s.z = s.x;
    stream.current.position.x = pouring
      ? Math.sin(clock.elapsedTime * 9) * 0.01
      : 0;
  });

  return (
    <group>
      {/* server */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.55, serverH, 72, 1, true]} />
        <Glass quality={quality} />
      </mesh>
      <mesh position={[0, -serverH / 2, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 72]} />
        <Glass quality={quality} />
      </mesh>
      <mesh position={[0, -serverH / 2 + serverFill / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.52 + level * 0.06, 0.5, serverFill, 72]} />
        <meshStandardMaterial color={COLORS.coffee} roughness={0.25} />
      </mesh>

      {/* dripper base ring */}
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.76, 0.22, 72, 1, true]} />
        <meshStandardMaterial
          color={COLORS.plasticDark}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.03, 12, 72]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.6} />
      </mesh>

      {/* cone */}
      <mesh
        position={[0, TOP_Y + 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <torusGeometry args={[TOP_R + 0.03, 0.035, 16, 96]} />
        <meshPhysicalMaterial
          color="#f3ede4"
          roughness={0.32}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
        />
      </mesh>
      <mesh geometry={cone} castShadow>
        <meshPhysicalMaterial
          color="#f3ede4"
          roughness={0.32}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      <instancedMesh ref={ribsRef} args={[ribs, undefined, RIBS]}>
        <meshStandardMaterial color="#e2d9cc" roughness={0.4} />
      </instancedMesh>

      {/* coffee bed */}
      <mesh
        position={[0, SPOUT_Y + 0.02 + bedH / 2 - 0.1, 0]}
        visible={coffee > 0}
      >
        <cylinderGeometry
          args={[
            radiusAt(SPOUT_Y + 0.02 + bedH) - 0.03,
            SPOUT_R - 0.02,
            bedH,
            48,
          ]}
        />
        <meshStandardMaterial color={COLORS.coffee} roughness={0.95} />
      </mesh>

      {/* slurry */}
      {slurry ? (
        <mesh geometry={slurry}>
          <meshStandardMaterial
            color={COLORS.coffeeLight}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      ) : null}

      {/* pour stream */}
      <mesh ref={stream} position={[0.15, TOP_Y + 0.55, 0]} scale={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.028, 1.1, 12]} />
        <meshPhysicalMaterial
          color="#cfe6ff"
          transparent
          opacity={0.7}
          roughness={0}
          transmission={0.6}
          thickness={0.2}
        />
      </mesh>
    </group>
  );
}
