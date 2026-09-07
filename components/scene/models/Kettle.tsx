"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { KETTLE_TIP, kettlePourPosition } from "./shapes";

/*
  Hario Buono kettle: bulbous ribbed stainless body, gooseneck spout low on the body,
  black knob and handle. Local origin = kettle bottom. When `pouring` it moves above the
  brewer and tilts; otherwise it rests out of frame.
*/

const BODY: [number, number][] = [
  [0, 0],
  [0.62, 0],
  [0.7, 0.04],
  [0.73, 0.14],
  [0.7, 0.22],
  [0.75, 0.32],
  [0.71, 0.4],
  [0.76, 0.5],
  [0.7, 0.6],
  [0.6, 0.74],
  [0.44, 0.84],
  [0.36, 0.88],
  [0.36, 0.92],
  [0.3, 0.98],
  [0.14, 1.03],
  [0, 1.04],
];

export function Kettle({
  pouring,
  target,
  spoutHeight = 1.9,
}: {
  pouring: boolean;
  /** where the brewer stands; the kettle pours above it */
  target: THREE.Vector3;
  spoutHeight?: number;
}) {
  const body = useMemo(() => {
    const curve = new THREE.SplineCurve(
      BODY.map(([r, y]) => new THREE.Vector2(r, y)),
    );
    return new THREE.LatheGeometry(curve.getPoints(72), 96);
  }, []);

  const spout = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, 0.22, 0),
      new THREE.Vector3(0.98, 0.34, 0),
      new THREE.Vector3(1.18, 0.7, 0),
      new THREE.Vector3(1.22, 1.05, 0),
      new THREE.Vector3(1.34, 1.2, 0),
      KETTLE_TIP.clone(),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.055, 16, false);
  }, []);

  const handle = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 1.0, 0),
      new THREE.Vector3(-0.7, 1.15, 0),
      new THREE.Vector3(-1.0, 0.9, 0),
      new THREE.Vector3(-0.92, 0.55, 0),
      new THREE.Vector3(-0.66, 0.42, 0),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.06, 14, false);
  }, []);

  const ref = useRef<THREE.Group>(null);
  const rest = useMemo(
    () => ({ pos: new THREE.Vector3(4.8, -1.3, -2.4), rot: 0 }),
    [],
  );
  const pour = useMemo(
    () => ({
      pos: kettlePourPosition(target, spoutHeight, -0.6),
      rot: -0.6,
    }),
    [target, spoutHeight],
  );

  const stream = useRef<THREE.Mesh>(null);
  const tip = useMemo(() => new THREE.Vector3(), []);
  const down = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = pouring ? pour : rest;
    g.position.lerp(t.pos, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, t.rot, 0.06);
    if (stream.current) {
      g.updateMatrixWorld();
      tip.copy(KETTLE_TIP).applyMatrix4(g.matrixWorld);
      const end = new THREE.Vector3(
        target.x,
        target.y + spoutHeight - 0.08,
        target.z,
      );
      const length = tip.distanceTo(end);
      stream.current.visible =
        pouring && g.position.distanceTo(pour.pos) < 0.08;
      stream.current.position.copy(tip).add(end).multiplyScalar(0.5);
      stream.current.quaternion.setFromUnitVectors(
        down,
        tip.sub(end).normalize(),
      );
      stream.current.scale.set(1, length, 1);
    }
  });

  const steel = (
    <meshStandardMaterial color="#d6d3cd" metalness={1} roughness={0.25} />
  );
  const black = <meshStandardMaterial color="#17130f" roughness={0.45} />;

  return (
    <group>
      <group ref={ref} position={rest.pos.toArray()}>
        <mesh geometry={body} castShadow>
          {steel}
        </mesh>
        <mesh geometry={spout} castShadow>
          {steel}
        </mesh>
        <mesh geometry={handle} castShadow>
          {black}
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.12, 32]} />
          {black}
        </mesh>
        <mesh position={KETTLE_TIP.toArray()} rotation={[0, 0, -0.7]}>
          <cylinderGeometry args={[0.043, 0.043, 0.005, 24]} />
          <meshStandardMaterial color="#171b1c" roughness={0.6} />
        </mesh>
      </group>
      <mesh ref={stream} visible={false}>
        <cylinderGeometry args={[0.012, 0.02, 1, 12]} />
        <meshPhysicalMaterial
          color="#e7f2f5"
          transparent
          opacity={0.65}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}
