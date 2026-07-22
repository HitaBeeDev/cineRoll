"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { FilterState } from "@cineroll/types";
import { fetchRandom } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

/** Rolls a random film from the current filtered set and navigates to it. */
export function useBrowseRoll(filters: FilterState) {
  const router = useRouter();
  const [rolling, setRolling] = useState(false);

  const roll = useCallback(async () => {
    if (rolling) return;
    setRolling(true);
    try {
      const { film } = await fetchRandom(filters);
      trackEvent({
        type: "roll",
        filmId: film.id,
        context: { source: "browse_results", filters },
      });
      router.push(`/film/${film.slug}`);
    } finally {
      setRolling(false);
    }
  }, [rolling, filters, router]);

  return { rolling, roll };
}
