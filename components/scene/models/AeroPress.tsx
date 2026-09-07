"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";

/*
  Procedural AeroPress: chamber (glass), plunger with rubber seal, filter cap, and the
  liquid column. `plunger` 0..1 moves the plunger down; the liquid shrinks with it.
  Upright: cap at the bottom, on a cup. Inverted: plunger at the bottom, cap on top.
*/

const CH_R = 0.5;
const CH_H = 1.25;
const PL_R = 0.45;
const PL_H = 1.15;
const TRAVEL = 0.95;
/** how far the plunger sits inside the chamber before pressing (real AeroPress: about a quarter) */
const SEATED = 0.3;

/** Smoky grey polypropylene, the real AeroPress chamber look. */
function Smoky() {
  return (
    <meshPhysicalMaterial
      color="#6b625b"
      transparent
      opacity={0.62}
      roughness={0.35}
      clearcoat={0.5}
      clearcoatRoughness={0.3}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

export function AeroPress({
  fill,
  coffee,
  plunger,
  inverted,
  quality: _quality,
}: {
  fill: number;
  coffee: number;
  plunger: number;
  inverted: boolean;
  quality: "high" | "low";
}) {
  const plungerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const cur = useRef({ plunger: 0, fill: 0 });
  const bedRef = useRef(0.1);

  useFrame(() => {
    const c = cur.current;
    c.plunger = THREE.MathUtils.lerp(c.plunger, plunger, 0.08);
    c.fill = THREE.MathUtils.lerp(c.fill, fill, 0.06);
    const p = c.plunger;
    if (plungerRef.current) {
      // plunger seal starts at the chamber top and travels down
      plungerRef.current.position.y = inverted
        ? 0.02 + 0.0 // sits as the base when inverted
        : CH_H - SEATED - p * TRAVEL;
    }
    if (liquidRef.current) {
      const maxH = CH_H - 0.12;
      const h = Math.max(0.001, c.fill * (maxH - SEATED) * (1 - p * 0.95));
      liquidRef.current.scale.y = h;
      // liquid rests on the cap (upright) or on the plunger seal (inverted)
      liquidRef.current.position.y =
        (inverted ? 0.12 : 0.08) + bedRef.current + h / 2;
    }
  });

  const cup = !inverted;
  const bedH = 0.06 + Math.min(1, Math.max(0, coffee)) * 0.16;
  bedRef.current = bedH;

  return (
    <group position={[0, inverted ? 0 : 0.55, 0]}>
      {/* cup under an upright press */}
      {cup ? (
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.5, 0.42, 0.8, 48]} />
          <meshStandardMaterial color={COLORS.ceramic} roughness={0.35} />
        </mesh>
      ) : null}

      {/* filter cap (bottom when upright, top when inverted) */}
      <mesh position={[0, inverted ? CH_H + 0.06 : 0.0, 0]}>
        <cylinderGeometry args={[CH_R + 0.05, CH_R + 0.05, 0.12, 48]} />
        <meshStandardMaterial color={COLORS.plasticDark} roughness={0.55} />
      </mesh>
      <mesh position={[0, inverted ? CH_H + 0.125 : -0.065, 0]}>
        <cylinderGeometry args={[CH_R - 0.05, CH_R - 0.05, 0.01, 48]} />
        <meshStandardMaterial color={COLORS.paper} roughness={0.9} />
      </mesh>

      {/* chamber */}
      <mesh position={[0, CH_H / 2 + 0.06, 0]}>
        <cylinderGeometry args={[CH_R, CH_R, CH_H, 48, 1, true]} />
        <Smoky />
      </mesh>
      {/* chamber marks */}
      {[0.32, 0.56, 0.8, 1.04].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[CH_R + 0.002, 0.004, 6, 48]} />
          <meshStandardMaterial
            color={i === 3 ? COLORS.crema : "#9c948b"}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* coffee bed */}
      <mesh position={[0, (inverted ? 0.12 : 0.08) + bedH / 2, 0]}>
        <cylinderGeometry args={[CH_R - 0.03, CH_R - 0.03, bedH, 48]} />
        <meshStandardMaterial color="#2e1b12" roughness={0.95} />
      </mesh>

      {/* liquid */}
      <mesh ref={liquidRef} position={[0, 0.5, 0]} scale={[1, 0.001, 1]}>
        <cylinderGeometry args={[CH_R - 0.03, CH_R - 0.03, 1, 48]} />
        <meshStandardMaterial color={COLORS.coffeeLight} roughness={0.2} />
      </mesh>

      {/* plunger */}
      <group
        ref={plungerRef}
        position={[0, inverted ? 0.02 : CH_H - SEATED, 0]}
      >
        <mesh position={[0, inverted ? -0.06 : 0.02, 0]}>
          <cylinderGeometry args={[PL_R, PL_R, 0.16, 48]} />
          <meshStandardMaterial color={COLORS.rubber} roughness={0.7} />
        </mesh>
        <mesh position={[0, inverted ? -PL_H / 2 - 0.1 : PL_H / 2, 0]}>
          <cylinderGeometry
            args={[PL_R - 0.05, PL_R - 0.05, PL_H, 48, 1, true]}
          />
          <Smoky />
        </mesh>
        <mesh position={[0, inverted ? -PL_H - 0.14 : PL_H + 0.04, 0]}>
          <cylinderGeometry args={[PL_R + 0.02, PL_R + 0.02, 0.08, 48]} />
          <meshStandardMaterial color={COLORS.plasticDark} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}
