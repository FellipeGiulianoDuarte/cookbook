/*
  The grinder someone owns, remembered on this device. Read on the client only; the URL
  still wins when a link names a grinder, so shared links stay exact.
*/
const KEY = "cookbook:my-grinder";

export function readMyGrinder(): string | undefined {
  try {
    return localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeMyGrinder(id: string | undefined) {
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  } catch {}
}
