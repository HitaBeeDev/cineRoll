"use client";

import { useRef } from "react";
import { calculateDecadeMetrics } from "../calculate-decade-metrics";
import type { DecadeDatum } from "../types";
import { DecadeBars } from "./decade-bars";
import { DecadeDetail } from "./decade-detail";
import { useActiveDecade } from "./use-active-decade";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type DecadeTimelineProps = { decades: DecadeDatum[]; peakDecade: number };

export function DecadeTimeline({ decades, peakDecade }: DecadeTimelineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { active, setActiveDecade } = useActiveDecade(decades, peakDecade, containerRef, reducedMotion);
  const metrics = calculateDecadeMetrics(decades);
  if (!active) return null;

  return (
    <div ref={containerRef} className="grid scroll-mt-24 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
      <DecadeBars decades={decades} activeDecade={active.decade} peakDecade={peakDecade} maximumFilmCount={metrics.maximumFilmCount} onSelect={setActiveDecade} />
      <DecadeDetail decade={active} peakDecade={peakDecade} averageFilmCount={metrics.averageFilmCount} totalFilms={metrics.totalFilms} />
    </div>
  );
}
