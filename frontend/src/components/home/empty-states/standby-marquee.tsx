"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StandbyMarqueeRow } from "@/components/home/empty-states/standby-marquee-row";

/** Slow horizontal ticker of award-winner titles — the "tonight's lineup" feel.
 *  Loops seamlessly (two copies, translate −50%); static when reduced motion. */
export function StandbyMarquee() {
  const prefersReduced = useReducedMotion();
  const fade =
    "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)";

  if (prefersReduced) {
    return (
      <div
        className="w-full overflow-hidden"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        <div className="flex justify-center">
          <StandbyMarqueeRow />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        <StandbyMarqueeRow />
        <StandbyMarqueeRow ariaHidden />
      </motion.div>
    </div>
  );
}
