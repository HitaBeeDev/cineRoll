"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

const SWEEP_SECONDS = 2.6;

/**
 * A ruler with one tick per year on record. On load a gold marker sweeps from
 * the first ceremony to the latest while its counter climbs the years — the
 * archive's span shown, not just stated. Decade ticks are taller and labelled.
 * The sweep is a single transform; reduced motion lands on the end state.
 */
export function CeremonyTimeline({ firstYear, lastYear }: { firstYear: number; lastYear: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const fillX = useTransform(progress, (p) => `${(p - 1) * 100}%`);
  const counterX = useTransform(progress, (p) => `${-p * 100}%`);
  const year = useTransform(progress, (p) => String(Math.round(firstYear + p * (lastYear - firstYear))));

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    const controls = animate(progress, 1, {
      duration: SWEEP_SECONDS,
      delay: 0.4,
      ease: [0.45, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [progress, reduceMotion]);

  const span = Math.max(lastYear - firstYear, 1);
  const years = Array.from({ length: span + 1 }, (_, index) => firstYear + index);

  return (
    <div aria-hidden className="select-none">
      <div className="relative overflow-hidden pt-8">
        {/* Gold fill with the marker on its leading edge, slid in from the left. */}
        <motion.div className="absolute inset-x-0 bottom-0 top-0" style={{ x: fillX }}>
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.12))]" />
          <div className="absolute bottom-0 right-0 top-6 w-px bg-gold shadow-[0_0_12px_rgba(212,175,55,0.9)]" />
          <motion.span
            className="absolute left-full top-0 font-[family-name:var(--font-geist-mono)] text-xs tabular-nums text-gold"
            style={{ x: counterX }}
          >
            {year}
          </motion.span>
        </motion.div>

        <div className="relative flex h-10 items-end justify-between">
          {years.map((y) => (
            <span
              key={y}
              className={y % 10 === 0 ? "h-6 w-px bg-white/35" : "h-2.5 w-px bg-white/15"}
            />
          ))}
        </div>
      </div>
      <div className="relative mt-2 hidden h-4 font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums text-fg-faint sm:block">
        {years
          .filter((y) => y % 20 === 0)
          .map((y) => (
            <span
              key={y}
              className="absolute -translate-x-1/2"
              style={{ left: `${((y - firstYear) / span) * 100}%` }}
            >
              {y}
            </span>
          ))}
      </div>
    </div>
  );
}
