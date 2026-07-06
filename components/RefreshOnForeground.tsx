"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// A PWA left open across app-switches/screen-locks never re-navigates, so a
// server-rendered page (e.g. "today") can sit stale for hours. Re-fetch when
// the app comes back to the foreground instead of forcing a refresh on every
// navigation/action (those already hit the server fresh).
const MIN_REFRESH_INTERVAL_MS = 5_000;

export function RefreshOnForeground() {
  const router = useRouter();

  useEffect(() => {
    let lastRefresh = Date.now();

    const refresh = () => {
      const now = Date.now();
      if (now - lastRefresh < MIN_REFRESH_INTERVAL_MS) return;
      lastRefresh = now;
      router.refresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  return null;
}
