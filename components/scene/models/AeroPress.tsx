"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Cup } from "./Cup";
import { lathe, pressPose } from "./shapes";

const R = 0.315;
const HEIGHT = 1.13;
const SHAFT = 0.82;
const CAP_ANGLES = Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI * 2);

function Markings() {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ecd39c";
      ctx.textAlign = "center";
      ctx.font = "500 58px sans-serif";
      for (let i = 1; i <= 4; i++) {
        const y = 670 - (i - 1) * 155;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ecd39c";
        ctx.beginPath();
        ctx.arc(128, y - 18, 43, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(String(i), 128, y);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={[0, 0.59, 0]}>
      <cylinderGeometry
        args={[R + 0.005, R + 0.005, 0.96, 32, 1, true, -0.42, 0.84]}
      />
      <meshBasicMaterial
        map={map}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}

export function AeroPress({
  fill,
  coffee,
  plunger,
  inverted,
  pouring = false,
}: {
  fill: number;
  coffee: number;
  plunger: number;
  inverted: boolean;
  pouring?: boolean;
}) {
  const chamberRef = useRef<THREE.Group>(null);
  const plungerRef = useRef<THREE.Group>(null);
  const capRef = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Mesh>(null);
  const bed = useRef<THREE.Mesh>(null);
  const cur = useRef({ plunger, fill });
  const pose = pressPose(inverted, plunger);
  const bedH = coffee > 0 ? 0.03 + Math.min(coffee, 1) * 0.07 : 0;
  const wall = useMemo(
    () =>
      lathe([
        [R, 0.035],
        [R, HEIGHT - 0.025],
        [R + 0.014, HEIGHT],
        [R - 0.023, HEIGHT],
        [R - 0.023, 0.035],
        [R, 0.035],
      ]),
    [],
  );
  useFrame((_, dt) => {
    cur.current.plunger = THREE.MathUtils.damp(
      cur.current.plunger,
      plunger,
      8,
      dt,
    );
    cur.current.fill = THREE.MathUtils.damp(cur.current.fill, fill, 8, dt);
    const p = pressPose(inverted, cur.current.plunger);
    if (chamberRef.current) chamberRef.current.position.y = p.chamber;
    if (plungerRef.current) plungerRef.current.position.y = p.seal;
    if (capRef.current) capRef.current.position.y = p.cap;
    if (bed.current) bed.current.position.y = p.bed + bedH / 2;
    if (liquid.current) {
      const ceiling = inverted ? p.chamber + HEIGHT - 0.07 : p.seal - 0.045;
      const height = Math.max(
        0.001,
        (ceiling - p.bed - bedH) *
          THREE.MathUtils.clamp(cur.current.fill, 0, 1),
      );
      liquid.current.scale.y = height;
      liquid.current.position.y = p.bed + bedH + height / 2;
    }
  });
  return (
    <group>
      {!inverted && <Cup />}
      <group ref={chamberRef} position={[0, pose.chamber, 0]}>
        <mesh geometry={wall}>
          <meshPhysicalMaterial
            color="#626c6b"
            transparent
            opacity={0.46}
            roughness={0.19}
            clearcoat={1}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          position={[0, inverted ? HEIGHT - 0.06 : 0.06, 0]}
          rotation={[0, Math.PI / 8, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.435, 0.435, 0.055, 8]} />
          <meshStandardMaterial color="#303736" roughness={0.36} />
        </mesh>
        <Markings />
      </group>
      <group
        ref={capRef}
        position={[0, pose.cap, 0]}
        visible={!inverted || !pouring}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.332, 0.332, 0.085, 64]} />
          <meshStandardMaterial color="#202625" roughness={0.48} />
        </mesh>
        {CAP_ANGLES.map((angle) => (
          <mesh
            key={angle}
            position={[Math.sin(angle) * 0.332, 0, Math.cos(angle) * 0.332]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.017, 0.066, 0.016]} />
            <meshStandardMaterial color="#363d3c" roughness={0.55} />
          </mesh>
        ))}
      </group>
      <group
        ref={plungerRef}
        position={[0, pose.seal, 0]}
        visible={inverted || !pouring}
      >
        <mesh castShadow>
          <cylinderGeometry args={[R - 0.025, R - 0.025, 0.09, 64]} />
          <meshStandardMaterial color="#171d1c" roughness={0.76} />
        </mesh>
        <group scale={[1, inverted ? -1 : 1, 1]}>
          <mesh position={[0, SHAFT / 2 + 0.025, 0]}>
            <cylinderGeometry args={[0.245, 0.25, SHAFT, 64, 1, true]} />
            <meshPhysicalMaterial
              color="#454e4d"
              transparent
              opacity={0.73}
              roughness={0.23}
              clearcoat={0.8}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, SHAFT + 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.37, 0.35, 0.07, 64]} />
            <meshStandardMaterial color="#272e2d" roughness={0.34} />
          </mesh>
        </group>
      </group>
      <mesh
        ref={bed}
        visible={coffee > 0}
        position={[0, pose.bed + bedH / 2, 0]}
      >
        <cylinderGeometry
          args={[R - 0.032, R - 0.032, Math.max(0.001, bedH), 64]}
        />
        <meshStandardMaterial color="#352015" roughness={1} />
      </mesh>
      <mesh ref={liquid} scale={[1, 0.001, 1]}>
        <cylinderGeometry args={[R - 0.033, R - 0.033, 1, 64]} />
        <meshStandardMaterial color="#513020" roughness={0.23} />
      </mesh>
    </group>
  );
}
