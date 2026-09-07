"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "../materials";
import { tube } from "./shapes";

/*
  Hario V60 02 on the 600 ml range server, modelled after the real set.
  Units: 1 = 8 cm. Local origin = server bottom, resting on the floor.

  Server: bell-shaped glass body, white silicone band at the neck, glass handle.
  Dripper: 60° ceramic cone, wide flat base plate that sits on the server, short skirt
  inside the neck, side handle, twelve spiral ridges inside, small drip hole.
*/

const SERVER_H = 1.0;
const SERVER_PROFILE: [number, number][] = [
  [0, 0],
  [0.48, 0.015],
  [0.56, 0.05],
  [0.59, 0.16],
  [0.57, 0.4],
  [0.5, 0.62],
  [0.5, 0.78],
  [0.43, 0.86],
  [0.42, 0.93],
  [0.43, SERVER_H],
];
const NECK_R = 0.42;

const PLATE_Y = SERVER_H + 0.02;
const CONE_BOTTOM_Y = PLATE_Y + 0.05;
const CONE_TOP_Y = CONE_BOTTOM_Y + 0.82;
const HOLE_R = 0.095;
const CONE_TOP_R = 0.57;
const WALL = 0.045;
const RIDGES = 24;

function coneRadius(y: number) {
  const t = (y - CONE_BOTTOM_Y) / (CONE_TOP_Y - CONE_BOTTOM_Y);
  return HOLE_R + t * (CONE_TOP_R - HOLE_R);
}

function toLathe(points: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

function splineLathe(points: [number, number][], segments = 96) {
  const curve = new THREE.SplineCurve(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
  );
  return new THREE.LatheGeometry(curve.getPoints(48), segments);
}

export function V60({
  fill,
  coffee,
  pouring: _pouring,
}: {
  fill: number;
  coffee: number;
  pouring: boolean;
}) {
  const server = useMemo(
    () =>
      splineLathe([
        ...SERVER_PROFILE,
        ...SERVER_PROFILE.slice(1)
          .reverse()
          .map(([r, y]) => [r - 0.022, Math.max(0.035, y)] as [number, number]),
        [0, 0.035],
      ]),
    [],
  );

  const level = Math.round(Math.max(0, Math.min(1, fill)) * 40) / 40;
  const serverLiquid = useMemo(() => {
    if (level <= 0) return null;
    const h = 0.04 + level * 0.6;
    const pts = SERVER_PROFILE.filter(([, y]) => y < h).map(
      ([r, y]) => [Math.max(0, r - 0.03), y] as [number, number],
    );
    const rAtH = pts[pts.length - 1][0];
    pts.push([rAtH, h], [0, h]);
    return toLathe(pts);
  }, [level]);

  const cone = useMemo(
    () =>
      toLathe([
        [HOLE_R, CONE_BOTTOM_Y],
        [CONE_TOP_R, CONE_TOP_Y],
        [CONE_TOP_R + WALL, CONE_TOP_Y - 0.01],
        [HOLE_R + WALL, CONE_BOTTOM_Y - 0.02],
      ]),
    [],
  );

  const plate = useMemo(
    () =>
      toLathe([
        [NECK_R - 0.03, PLATE_Y - 0.14],
        [NECK_R - 0.03, PLATE_Y],
        [HOLE_R + WALL, PLATE_Y],
        [HOLE_R + WALL, PLATE_Y + 0.05],
        [0.66, PLATE_Y + 0.05],
        [0.68, PLATE_Y + 0.02],
        [0.66, PLATE_Y - 0.02],
        [NECK_R + 0.01, PLATE_Y - 0.02],
        [NECK_R + 0.01, PLATE_Y - 0.14],
      ]),
    [],
  );

  const ridges = useMemo(() => {
    const geos: { id: string; geo: THREE.TubeGeometry }[] = [];
    for (let i = 0; i < RIDGES; i++) {
      const a0 = (i / RIDGES) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        const y =
          CONE_BOTTOM_Y + 0.05 + t * (CONE_TOP_Y - CONE_BOTTOM_Y - 0.12);
        const r = coneRadius(y) + WALL - 0.002;
        const a = a0 + t * 0.9;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      geos.push({
        id: `ridge-${Math.round(a0 * 1000)}`,
        geo: new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(pts),
          24,
          0.012,
          8,
          false,
        ),
      });
    }
    return geos;
  }, []);

  const paper = useMemo(
    () =>
      toLathe([
        [HOLE_R - 0.015, CONE_BOTTOM_Y + 0.025],
        [CONE_TOP_R - 0.012, CONE_TOP_Y - 0.015],
      ]),
    [],
  );
  const bedH = coffee <= 0 ? 0.0001 : 0.1 + Math.min(1, coffee) * 0.24;
  const bed = useMemo(() => {
    const y0 = CONE_BOTTOM_Y + 0.01;
    const y1 = y0 + bedH;
    return toLathe(
      [
        [0, y0],
        [HOLE_R, y0],
        [coneRadius(y1) - 0.025, y1],
        [0, y1 + 0.01],
      ],
      72,
    );
  }, [bedH]);
  const slurry = useMemo(() => {
    if (level <= 0) return null;
    const base = CONE_BOTTOM_Y + 0.01 + bedH;
    const top = Math.min(
      CONE_TOP_Y - 0.08,
      base + 0.02 + level * (CONE_TOP_Y - base - 0.1),
    );
    return toLathe(
      [
        [0, base],
        [coneRadius(base) - 0.025, base],
        [coneRadius(top) - 0.025, top],
        [0, top],
      ],
      72,
    );
  }, [level, bedH]);

  const serverHandle = useMemo(
    () =>
      tube(
        [
          [0.43, 0.9, 0],
          [0.74, 0.88, 0],
          [0.83, 0.63, 0],
          [0.73, 0.38, 0],
          [0.57, 0.35, 0],
        ],
        0.045,
      ),
    [],
  );
  const dripperHandle = useMemo(
    () =>
      tube(
        [
          [0.51, CONE_TOP_Y - 0.08, 0],
          [0.79, CONE_TOP_Y - 0.08, 0],
          [0.83, CONE_TOP_Y - 0.29, 0],
          [0.62, CONE_TOP_Y - 0.47, 0],
          [0.37, CONE_TOP_Y - 0.43, 0],
        ],
        0.043,
      ),
    [],
  );
  const glass = (
    <meshPhysicalMaterial
      color="#ffffff"
      transparent
      opacity={0.22}
      roughness={0.04}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.05}
      reflectivity={0.9}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
  const ceramic = (
    <meshPhysicalMaterial
      color="#f4efe7"
      roughness={0.28}
      clearcoat={0.8}
      clearcoatRoughness={0.2}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group>
      <mesh geometry={server}>{glass}</mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry
          args={[NECK_R + 0.03, NECK_R + 0.03, 0.12, 96, 1, true]}
        />
        <meshStandardMaterial
          color="#f6f2ec"
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={serverHandle}>{glass}</mesh>
      <mesh position={[0, SERVER_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[NECK_R, 0.018, 12, 96]} />
        {glass}
      </mesh>
      {serverLiquid ? (
        <mesh geometry={serverLiquid}>
          <meshStandardMaterial color={COLORS.coffee} roughness={0.15} />
        </mesh>
      ) : null}

      <mesh geometry={plate} castShadow>
        {ceramic}
      </mesh>
      <mesh geometry={cone} castShadow>
        {ceramic}
      </mesh>
      {ridges.map(({ id, geo }) => (
        <mesh key={id} geometry={geo}>
          <meshPhysicalMaterial
            color="#f4efe7"
            roughness={0.35}
            clearcoat={0.5}
          />
        </mesh>
      ))}
      <mesh geometry={dripperHandle} castShadow>
        {ceramic}
      </mesh>
      <mesh
        position={[0, CONE_TOP_Y - 0.007, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[CONE_TOP_R + WALL / 2, WALL / 2, 12, 96]} />
        {ceramic}
      </mesh>
      <mesh geometry={paper}>
        <meshStandardMaterial
          color={COLORS.paper}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={bed} visible={coffee > 0}>
        <meshStandardMaterial color={COLORS.coffee} roughness={0.95} />
      </mesh>
      {slurry ? (
        <mesh geometry={slurry}>
          <meshStandardMaterial
            color={COLORS.coffeeLight}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      ) : null}
    </group>
  );
}

/** Height of the assembled V60 set, for camera framing. */
export const V60_HEIGHT = CONE_TOP_Y;
