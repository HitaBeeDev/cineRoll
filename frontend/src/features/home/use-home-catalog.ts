"use client";

import { useEffect, useState } from "react";
import { fetchGenres, fetchRandomCount } from "@/lib/api";

export function useHomeCatalog() {
  const [genres, setGenres] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    void fetchGenres().then(setGenres).catch(() => setGenres([]));
    void fetchRandomCount().then(setTotalCount).catch(() => setTotalCount(null));
  }, []);

  return { genres, totalCount };
}
