"use client";

import { useEffect, useState } from "react";
import { detectCountry } from "@/components/where-to-watch/detect-country";

/** Resolves the viewer's country on the client after mount — null until then,
 *  so the server and first client render agree (no hydration flash). */
export function useDetectedCountry(): string | null {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setCountry(detectCountry()), 0);
    return () => window.clearTimeout(t);
  }, []);

  return country;
}
