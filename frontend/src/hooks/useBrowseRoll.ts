"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { FilterState } from "@cineroll/types";
import { fetchFilmBySlug } from "@/lib/api/films-client/fetch-film-by-slug";
import type { RandomResult } from "@/lib/api";
import { useRollSession } from "@/features/roll/use-roll-session";
import { ROLL_SEARCH_PARAM } from "@/lib/browse/filter-params/roll-search-param";

/** `empty` is the filters returning nothing — the user's problem to fix, and a
 *  different message from the network being down. */
export type BrowseRollError = "empty" | "failed";

/**
 * The browse page's roll: the shared session, shown in a dialog, with the result
 * named in the URL.
 *
 * The dialog used to be pure component state, which made the result the one
 * thing on this page you could not refresh into, link to, or send anyone —
 * odd, for the single moment the product is built around. `?roll=<slug>` fixes
 * that at the cost of one query param: reload and your film is still there; send
 * the link and it opens on the film you got, over the filters that produced it.
 *
 * A film restored from a link is deliberately *not* a draw. It is not filed in
 * the shuffle bag, earns no penalty and no lane reward, and is never graded —
 * the engine did not choose it for whoever is reading, and must not learn as
 * though it had. Rolling again from there starts a real draw.
 */
export function useBrowseRoll(filters: FilterState) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = useSession().data?.user?.id;
  const rollSlug = searchParams.get(ROLL_SEARCH_PARAM);

  // Openness is mostly read, not held: the URL already says whether there is a
  // film on show. The one thing it cannot say is "a draw is in flight and has
  // not landed yet", which is what this covers.
  const [openedByRoll, setOpenedByRoll] = useState(false);
  const [error, setError] = useState<BrowseRollError | null>(null);

  // `replace`, not `push`: rolling five times should not cost five presses of
  // the back button to leave the page. The param is a bookmark of where you are,
  // not a step in the journey.
  const writeRollSlug = useCallback(
    (slug: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (slug) next.set(ROLL_SEARCH_PARAM, slug);
      else next.delete(ROLL_SEARCH_PARAM);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onRollStart = useCallback(() => {
    setOpenedByRoll(true);
    setError(null);
  }, []);

  const onResult = useCallback(
    (result: RandomResult) => writeRollSlug(result.film.slug),
    [writeRollSlug],
  );

  const onError = useCallback((caught: unknown) => {
    const code = caught instanceof Error ? (caught as Error & { code?: string }).code : undefined;
    setError(code === "NO_FILMS_FOUND" ? "empty" : "failed");
  }, []);

  const session = useRollSession({
    filters,
    userId,
    source: "browse_results",
    onRollStart,
    onResult,
    onError,
  });
  const { film, setFilm, isRolling } = session;

  // Derived, not stored: the URL names a film we are not showing, so one is on
  // its way. A roll's own write back to the URL settles this to false the moment
  // the film it names is the film in hand, which is what keeps it from looping.
  const restoring = Boolean(rollSlug) && !isRolling && film?.slug !== rollSlug && !error;

  // Restores the film named in the URL — a refresh, or someone else's link.
  useEffect(() => {
    if (!restoring || !rollSlug) return;

    let cancelled = false;
    fetchFilmBySlug(rollSlug)
      .then((restored) => {
        if (!cancelled) setFilm(restored);
      })
      .catch(() => {
        if (!cancelled) setError("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [restoring, rollSlug, setFilm]);

  const close = useCallback(() => {
    setOpenedByRoll(false);
    setError(null);
    writeRollSlug(null);
  }, [writeRollSlug]);

  const markEngaged = useCallback(() => {
    if (film) session.markEngaged(film.id);
  }, [film, session]);

  const markRejected = useCallback(() => {
    if (film) session.markRejected(film.id);
  }, [film, session]);

  return {
    isOpen: openedByRoll || Boolean(rollSlug),
    rolling: isRolling || restoring,
    film,
    error,
    roll: session.roll,
    close,
    markEngaged,
    markRejected,
  };
}
