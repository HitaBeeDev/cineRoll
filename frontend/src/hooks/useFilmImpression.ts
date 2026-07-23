"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@cineroll/types";
import { trackFilmImpression } from "@/lib/analytics";

/**
 * Fires a single film-impression event the first time the returned ref's node is
 * at least half visible, then disconnects. No-op when IntersectionObserver is
 * unavailable (SSR / older browsers).
 */
export function useFilmImpression<T extends Element>(film: Film, surface: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackFilmImpression(film.id, {
          title: film.title,
          slug: film.slug,
          surface,
        });
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [film.id, film.slug, film.title, surface]);

  return ref;
}
