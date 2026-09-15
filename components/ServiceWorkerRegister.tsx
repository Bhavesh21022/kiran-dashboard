"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silent — offline caching is a nice-to-have, not a hard requirement
      });
    }
  }, []);
  return null;
}
