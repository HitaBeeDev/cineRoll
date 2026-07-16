"use client";

import { useEffect, useState, type RefObject } from "react";
import type { DecadeDatum } from "../types";

export function useActiveDecade(
  decades: DecadeDatum[],
  initialDecade: number,
  containerRef: RefObject<HTMLDivElement | null>,
  reducedMotion: boolean,
) {
  const [activeDecade, setActiveDecade] = useState(initialDecade);

  useEffect(() => {
    const applyHash = () => selectHashDecade(decades, setActiveDecade, containerRef, reducedMotion);
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [decades, containerRef, reducedMotion]);

  const active = decades.find(({ decade }) => decade === activeDecade) ?? decades.at(-1);
  return { active, setActiveDecade };
}

function selectHashDecade(
  decades: DecadeDatum[],
  select: (decade: number) => void,
  containerRef: RefObject<HTMLDivElement | null>,
  reducedMotion: boolean,
): void {
  const match = window.location.hash.match(/^#decade-(\d{3,4})$/);
  const decade = match ? Number(match[1]) : Number.NaN;
  if (!decades.some((item) => item.decade === decade)) return;
  select(decade);
  containerRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
}
