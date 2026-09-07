"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Fallback } from "./Fallback";
import type { SceneState } from "./types";

/*
  The only allowed way to load React Three Fiber in the App Router: a client wrapper that
  imports the Canvas with ssr:false. Falls back to the static illustration while loading,
  when WebGL is missing, and when the user prefers reduced motion.
*/
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** prefers-reduced-motion, read from matchMedia so emulated settings (tests, OS toggles) apply. */
function usePrefersReducedMotion(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

export function SceneClient({
  state,
  className,
}: {
  state: SceneState;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    setOk(webglAvailable());
  }, []);

  const pending = reduce === null || ok === null;
  const useFallback = reduce === true || ok === false;
  return (
    <div
      className={className}
      data-scene={pending ? "pending" : useFallback ? "fallback" : "webgl"}
    >
      {useFallback || pending ? (
        <Fallback method={state.method} fill={state.fill} className="h-full" />
      ) : (
        <Scene state={state} />
      )}
    </div>
  );
}
