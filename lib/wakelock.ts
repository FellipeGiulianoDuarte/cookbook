"use client";

/*
  Keep the screen on during the brew. The lock is released when the tab hides, so it is
  re-requested on visibilitychange. Safari iOS 16.4+, Chrome 85+, Firefox 126+.
*/

export function createWakeLock() {
  let sentinel: WakeLockSentinel | null = null;
  let wanted = false;

  async function request() {
    if (
      !wanted ||
      typeof navigator === "undefined" ||
      !("wakeLock" in navigator)
    )
      return;
    try {
      sentinel = await navigator.wakeLock.request("screen");
      sentinel.addEventListener("release", () => {
        sentinel = null;
      });
    } catch {
      // denied or unsupported: the timer still works, the screen may dim
    }
  }

  function onVisibility() {
    if (document.visibilityState === "visible" && wanted && !sentinel)
      void request();
  }

  return {
    acquire() {
      wanted = true;
      document.addEventListener("visibilitychange", onVisibility);
      void request();
    },
    release() {
      wanted = false;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release();
      sentinel = null;
    },
  };
}

export type WakeLockController = ReturnType<typeof createWakeLock>;
