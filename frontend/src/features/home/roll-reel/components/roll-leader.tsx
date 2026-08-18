"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ROLL_TIMINGS } from "../roll-timings";

const COUNTS = [3, 2, 1];

/**
 * The academy leader: crosshairs, a sweeping hand, 3·2·1.
 *
 * It plays on the first roll of a session and never again. As an opening title
 * it earns its second and a half; in front of every roll it would be a toll.
 */
export function RollLeader() {
  const [step, setStep] = useState(0);
  const stepMs = ROLL_TIMINGS.LEADER_MS / COUNTS.length;

  useEffect(() => {
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, COUNTS.length - 1)),
      stepMs,
    );
    return () => window.clearInterval(timer);
  }, [stepMs]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-[#050509]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="relative h-[190px] w-[190px]">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="100" cy="100" r="94" fill="none" stroke="#1e1e2c" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="#1e1e2c" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="#1e1e2c" strokeWidth="1" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="#1e1e2c" strokeWidth="1" />
          {/* The sweeping hand: one turn per count, linear, like a shutter. */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="8"
            stroke="#e8453c"
            strokeWidth="2.5"
            style={{ originX: "100px", originY: "100px" }}
            animate={{ rotate: 360 * COUNTS.length }}
            transition={{ duration: ROLL_TIMINGS.LEADER_MS / 1000, ease: "linear" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={COUNTS[step]}
              className="font-[family-name:var(--font-display)] text-[76px] font-bold leading-none text-[#f2eef8]"
              initial={{ opacity: 0, scale: 1.25 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {COUNTS[step]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
