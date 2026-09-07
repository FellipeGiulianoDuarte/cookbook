"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";

/*
  Glass with two quality levels. The transmission material renders the scene twice for
  refraction; on a weak phone the PerformanceMonitor switches to a plain physical material.
*/
export function Glass({
  quality,
  tint = "#ffffff",
}: {
  quality: "high" | "low";
  tint?: string;
}) {
  if (quality === "high") {
    return (
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.35}
        roughness={0.12}
        ior={1.5}
        chromaticAberration={0.025}
        anisotropicBlur={0.2}
        distortion={0.05}
        distortionScale={0.2}
        temporalDistortion={0}
        samples={6}
        resolution={512}
        color={tint}
        background={undefined}
      />
    );
  }
  return (
    <meshPhysicalMaterial
      color={tint}
      transparent
      opacity={0.28}
      roughness={0.15}
      metalness={0}
      transmission={0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      depthWrite={false}
    />
  );
}
