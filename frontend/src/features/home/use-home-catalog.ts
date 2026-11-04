"use client";

import { useEffect, useState } from "react";
import { fetchGenres, fetchRandomCount } from "@/lib/api";

/** `initialTotalCount` comes from the server render, so the archive size is in
 *  the first HTML instead of a loading placeholder; the client refresh keeps it current. */
export function useHomeCatalog(initialTotalCount: number | null = null) {
  const [genres, setGenres] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(initialTotalCount);

  useEffect(() => {
    void fetchGenres().then(setGenres).catch(() => setGenres([]));
    void fetchRandomCount()
      .then(({ total }) => setTotalCount(total))
      .catch(() => {});
  }, []);

  return { genres, totalCount };
}
