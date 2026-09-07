"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/*
  Crossfade a value change. A plain swap shows two states at once; a short blur bridges
  them so the eye reads one thing changing. Uses transform strings so the animation is
  hardware-accelerated.
*/
const EASE = [0.23, 1, 0.32, 1] as const;

export function Crossfade({
  id,
  children,
  className,
}: {
  id: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={id}
        className={className}
        style={{ display: "inline-block" }}
        initial={{
          opacity: 0,
          filter: "blur(3px)",
          transform: "translateY(4px)",
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transform: "translateY(0px)",
        }}
        exit={{
          opacity: 0,
          filter: "blur(3px)",
          transform: "translateY(-4px)",
          transition: { duration: 0.1 },
        }}
        transition={{ duration: 0.18, ease: EASE }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
