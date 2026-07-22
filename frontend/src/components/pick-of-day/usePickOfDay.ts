"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPickOfDay, type PickOfDayFilm } from "@/lib/api";

export type PickOfDayStatus = "loading" | "success" | "empty" | "error";

/** Loads today's staff pick. Exposes the load status and a `retry` for the
 *  error state; a null result maps to "empty" rather than an error. */
export function usePickOfDay() {
  const [film, setFilm] = useState<PickOfDayFilm | null>(null);
  const [status, setStatus] = useState<PickOfDayStatus>("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await fetchPickOfDay();
      if (!result) {
        setFilm(null);
        setStatus("empty");
        return;
      }
      setFilm(result);
      setStatus("success");
    } catch {
      setFilm(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  return { film, status, retry: load };
}
