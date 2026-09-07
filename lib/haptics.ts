"use client";

/** Vibration exists on Android browsers only; Safari has no web haptics. Silent no-op elsewhere. */
export function haptic(pattern: number | number[] = 40) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator)
      navigator.vibrate(pattern);
  } catch {}
}
