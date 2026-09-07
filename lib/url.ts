import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { Method, Process, RoastLevel } from "./schema";

/*
  Every selection lives in the URL so a recipe is a shareable link, and the OG image
  route reads the same parameters. Timer state never goes here.
*/

export const urlParsers = {
  m: parseAsStringLiteral(Method.options),
  r: parseAsString,
  g: parseAsString,
  d: parseAsFloat,
  roast: parseAsStringLiteral(RoastLevel.options).withDefault("medium"),
  proc: parseAsStringLiteral(Process.options),
  orient: parseAsStringLiteral(["upright", "inverted"] as const),
  off: parseAsInteger.withDefault(0),
  nudge: parseAsBoolean.withDefault(false),
  step: parseAsStringLiteral([
    "method",
    "recipe",
    "grinder",
    "amount",
    "bean",
    "options",
    "summary",
  ] as const),
};

export const searchParamsCache = createSearchParamsCache(urlParsers);
export type UrlState = Awaited<ReturnType<typeof searchParamsCache.parse>>;
