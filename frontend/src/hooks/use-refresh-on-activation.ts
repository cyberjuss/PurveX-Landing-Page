"use client";

import { useEffect, useRef } from "react";

export function useRefreshOnActivation(onRefresh: () => void, minIntervalMs = 15000) {
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < minIntervalMs) {
        return;
      }
      lastRefreshRef.current = now;
      onRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [minIntervalMs, onRefresh]);
}
