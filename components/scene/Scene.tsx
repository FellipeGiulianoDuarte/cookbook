"use client";

import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { AeroPress } from "./models/AeroPress";
import { Beans } from "./models/Beans";
import { Grinder } from "./models/Grinder";
import { Kettle } from "./models/Kettle";
import { V60 } from "./models/V60";
import type { SceneState } from "./types";

/*
  One canvas for the whole app. Objects sit at fixed spots; the camera rig moves between
  them. A procedural environment (light formers) gives the glass something to reflect
  without downloading an HDR. PerformanceMonitor drops pixel ratio and glass quality
  on weak devices.
*/

const SPOTS = {
  v60: new THREE.Vector3(-1.6, 0, 0),
  aeropress: new THREE.Vector3(1.75, -0.85, 0),
  grinder: new THREE.Vector3(0, 0, -6),
  beans: new THREE.Vector3(6, 0, -6),
} as const;

export default function Scene({ state }: { state: SceneState }) {
  const [dpr, setDpr] = useState(1.5);
  const [quality, setQuality] = useState<"high" | "low">("high");

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 1.2, 8], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setQuality("low");
          }}
          onIncline={() => setDpr(1.5)}
          flipflops={2}
        />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={2.0}
          color="#fff1dc"
          castShadow={false}
        />
        <directionalLight
          position={[-3, 2, 4]}
          intensity={0.9}
          color="#ffe8cf"
        />
        <directionalLight
          position={[-5, 3, -2]}
          intensity={0.5}
          color="#cfd8ff"
        />
        <pointLight
          position={[2, 2.5, -3]}
          intensity={18}
          color="#ffe3c0"
          distance={9}
        />
        <Environment resolution={256} frames={1} environmentIntensity={0.9}>
          <Lightformer
            form="rect"
            intensity={4}
            position={[0, 6, -6]}
            scale={[12, 5, 1]}
            color="#fff6ea"
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            position={[-7, 2, 2]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[6, 3, 1]}
            color="#f6dcb8"
          />
          <Lightformer
            form="circle"
            intensity={2.5}
            position={[5, 4, 5]}
            scale={3}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={1}
            position={[0, -3, 4]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[8, 8, 1]}
            color="#e8dccb"
          />
        </Environment>

        <Rig state={state} />

        <Turntable
          position={SPOTS.v60}
          on={state.idle && state.focus === "brewers"}
          visible={state.focus === "brewers" || state.method !== "aeropress"}
        >
          <Float
            floatIntensity={state.idle && state.focus === "brewers" ? 0.25 : 0}
            rotationIntensity={0}
            speed={1.2}
          >
            <V60
              fill={state.method === "v60" ? state.fill : 0}
              coffee={state.coffee}
              pouring={state.pouring && state.method === "v60"}
              quality={quality}
            />
          </Float>
        </Turntable>
        <Turntable
          position={SPOTS.aeropress}
          on={state.idle && state.focus === "brewers"}
          scale={0.95}
          phase={1.7}
          visible={state.focus === "brewers" || state.method === "aeropress"}
        >
          <Float
            floatIntensity={state.idle && state.focus === "brewers" ? 0.25 : 0}
            rotationIntensity={0}
            speed={1.4}
          >
            <AeroPress
              fill={state.method === "aeropress" ? state.fill : 0}
              coffee={state.coffee}
              plunger={state.method === "aeropress" ? state.plunger : 0}
              inverted={state.inverted}
              quality={quality}
            />
          </Float>
        </Turntable>
        <group
          position={SPOTS.beans.toArray()}
          visible={state.focus === "bean"}
        >
          <Beans roast={state.roast} spin={state.focus === "bean"} />
        </group>
        <group
          position={SPOTS.grinder.toArray()}
          visible={state.focus === "grinder"}
        >
          <Grinder
            ticks={state.dialTicks}
            value={state.dialValue}
            spin={state.focus === "grinder"}
          />
        </group>

        <group visible={state.focus === "brewing"}>
          <Kettle pouring={state.pouring} />
        </group>

        {/* floor: a dark disc under everything, lit by two pools */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.32, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial
            color="#e6dccd"
            roughness={0.95}
            metalness={0}
          />
        </mesh>
        <spotLight
          position={[SPOTS.v60.x, 5, 1.5]}
          angle={0.5}
          penumbra={1}
          intensity={30}
          color="#ffe6c8"
          distance={12}
          target-position={SPOTS.v60.toArray()}
        />
        <spotLight
          position={[SPOTS.aeropress.x, 5, 1.5]}
          angle={0.5}
          penumbra={1}
          intensity={30}
          color="#ffe6c8"
          distance={12}
        />

        <ContactShadows
          position={[0, -1.31, 0]}
          opacity={0.45}
          scale={12}
          blur={2.4}
          far={3}
          color="#000000"
          frames={1}
        />
      </Suspense>
    </Canvas>
  );
}

/** Slow turntable for the hero view; still when off. */
function Turntable({
  children,
  position,
  on,
  scale = 1,
  phase = 0,
  visible = true,
}: {
  children: React.ReactNode;
  position: THREE.Vector3;
  on: boolean;
  scale?: number;
  phase?: number;
  visible?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (on) ref.current.rotation.y += dt * 0.25;
    else
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        0.35,
        0.05,
      );
  });
  return (
    <group
      ref={ref}
      position={position.toArray()}
      scale={scale}
      rotation={[0, phase, 0]}
      visible={visible}
    >
      {children}
    </group>
  );
}

/**
 * Moves the camera between objects. Each view is a bounding sphere; the distance is
 * computed from the canvas aspect so the object always fits with a margin, on any screen.
 */
const VIEWS: Record<
  string,
  { center: THREE.Vector3; radius: number; dir: THREE.Vector3 }
> = {
  brewers: {
    center: new THREE.Vector3(0.05, 0.0, 0),
    radius: 2.45,
    dir: new THREE.Vector3(0.12, 0.22, 1).normalize(),
  },
  v60: {
    center: new THREE.Vector3(SPOTS.v60.x, 0.12, 0),
    radius: 1.55,
    dir: new THREE.Vector3(0.35, 0.25, 1).normalize(),
  },
  aeropress: {
    center: new THREE.Vector3(SPOTS.aeropress.x, 0.35, 0),
    radius: 1.5,
    dir: new THREE.Vector3(0.35, 0.22, 1).normalize(),
  },
  grinder: {
    center: new THREE.Vector3(
      SPOTS.grinder.x,
      SPOTS.grinder.y + 0.2,
      SPOTS.grinder.z,
    ),
    radius: 1.75,
    dir: new THREE.Vector3(0.45, 0.3, 1).normalize(),
  },
  bean: {
    center: new THREE.Vector3(
      SPOTS.beans.x,
      SPOTS.beans.y - 0.95,
      SPOTS.beans.z,
    ),
    radius: 1.1,
    dir: new THREE.Vector3(0.2, 0.75, 1).normalize(),
  },
  v60Brewing: {
    center: new THREE.Vector3(SPOTS.v60.x + 0.2, 0.55, 0),
    radius: 1.9,
    dir: new THREE.Vector3(0.3, 0.2, 1).normalize(),
  },
  aeropressBrewing: {
    center: new THREE.Vector3(SPOTS.aeropress.x + 0.1, 0.6, 0),
    radius: 1.75,
    dir: new THREE.Vector3(0.3, 0.2, 1).normalize(),
  },
};

function viewKey(state: SceneState): keyof typeof VIEWS {
  if (state.focus === "brewers") return "brewers";
  if (state.focus === "grinder") return "grinder";
  if (state.focus === "bean") return "bean";
  const ap = state.method === "aeropress";
  if (state.focus === "brewing") return ap ? "aeropressBrewing" : "v60Brewing";
  return ap ? "aeropress" : "v60";
}

function Rig({ state }: { state: SceneState }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const lookCur = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ clock }) => {
    const key = viewKey(state);
    const view = VIEWS[key];
    const cam = camera as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const aspect = size.width / Math.max(1, size.height);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const half = Math.min(vFov, hFov) / 2;
    const dist = (view.radius * 1.08) / Math.sin(half);
    const sway =
      state.idle && state.focus === "brewers"
        ? Math.sin(clock.elapsedTime * 0.2) * 0.15
        : 0;
    target.current
      .copy(view.dir)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), sway)
      .multiplyScalar(dist)
      .add(view.center);
    camera.position.lerp(target.current, 0.06);
    lookCur.current.lerp(view.center, 0.06);
    camera.lookAt(lookCur.current);
  });
  return null;
}
