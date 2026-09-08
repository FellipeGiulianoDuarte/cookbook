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
  as = "span",
}: {
  id: string | number;
  children: ReactNode;
  className?: string;
  /** "div" for block content (paragraphs, cards); "span" for a value inside a line */
  as?: "span" | "div";
}) {
  const Tag = as === "div" ? motion.div : motion.span;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Tag
        key={id}
        className={className}
        style={as === "span" ? { display: "inline-block" } : undefined}
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
      </Tag>
    </AnimatePresence>
  );
}
