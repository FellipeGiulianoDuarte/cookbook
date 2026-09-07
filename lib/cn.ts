/** Join class names, skipping falsy values. Small enough that no dependency is needed. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
