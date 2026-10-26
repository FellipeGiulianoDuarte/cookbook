"use client";

/*
  Haptic feedback, used sparingly: a light tap when something is chosen, two taps when the
  brew moves to the next step, three when it is done. Nothing on scroll, hover or drag.

  Android: the Vibration API. iPhone: Safari has no vibration API, but since iOS 18 toggling
  a native switch control plays the system selection haptic, so a hidden
  <input type="checkbox" switch> is clicked instead. iOS honours it reliably only inside a
  user gesture; taps fired by the brew timer may stay silent there.
*/

export type HapticKind = "select" | "step" | "done";

const ANDROID: Record<HapticKind, number | number[]> = {
  select: 10,
  step: [30, 70, 30],
  done: [40, 70, 40, 70, 40],
};
const IOS_TAPS: Record<HapticKind, number> = { select: 1, step: 2, done: 3 };
const MIN_GAP_MS = 80;

let last = 0;
let iosLabel: HTMLLabelElement | null = null;

function iosSwitch(): HTMLLabelElement | null {
  if (iosLabel) return iosLabel;
  if (typeof document === "undefined") return null;
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText =
    "position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.appendChild(input);
  document.body.appendChild(label);
  iosLabel = label;
  return label;
}

function canVibrate() {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function haptic(kind: HapticKind = "select") {
  const now = Date.now();
  if (now - last < MIN_GAP_MS) return;
  last = now;
  try {
    if (canVibrate()) {
      navigator.vibrate(ANDROID[kind]);
      return;
    }
    const label = iosSwitch();
    if (!label) return;
    for (let i = 0; i < IOS_TAPS[kind]; i++)
      setTimeout(() => label.click(), i * 110);
  } catch {}
}
