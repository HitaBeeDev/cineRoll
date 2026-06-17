"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    void trackEvent({
      type: "PAGE_VIEW",
      context: {
        path: pathname,
        query: query || null,
        referrer: document.referrer || null,
      },
    });
  }, [pathname, searchParams]);

  return null;
}
