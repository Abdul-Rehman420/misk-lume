"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Sends page-view events to /api/analytics (fire-and-forget). De-duplicates
// consecutive views of the same path and never throws, so analytics can never
// affect rendering.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "page_view",
        page: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
