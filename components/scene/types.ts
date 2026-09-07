import type { Method } from "@/lib/schema";

/** What the wizard and the brew screen tell the scene. Targets only; the scene animates toward them. */
export interface SceneState {
  method?: Method;
  /** which object the camera frames */
  focus: "brewers" | "brewer" | "grinder" | "bean" | "brewing";
  /** 0..1 water in the brewer */
  fill: number;
  /** 0..1 amount of coffee in the brewer (dose relative to the recipe's maximum) */
  coffee: number;
  /** roast level of the bean, 0 = light, 1 = dark */
  roast: number;
  /** water is being poured right now */
  pouring: boolean;
  /** AeroPress plunger travel, 0 = up, 1 = fully pressed */
  plunger: number;
  /** AeroPress orientation */
  inverted: boolean;
  /** grinder dial: ticks per rotation and the target value in ticks from zero */
  dialTicks: number;
  dialValue: number;
  /** slow idle motion (off during the brew to keep attention on the pour) */
  idle: boolean;
}

export const SCENE_DEFAULT: SceneState = {
  focus: "brewers",
  fill: 0,
  coffee: 0.5,
  roast: 0.5,
  pouring: false,
  plunger: 0,
  inverted: false,
  dialTicks: 12,
  dialValue: 14,
  idle: true,
};
