"use client";

import { motion } from "framer-motion";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitchTiles'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Grain and bulb flicker, alive only while the strip is running.
 *
 * Constant grain becomes wallpaper within a session; grain that arrives with the
 * spin and leaves with it is a projector switching on. Opacity is the only thing
 * animating, so the flicker costs nothing on the compositor.
 */
export function ReelGrain({ active }: { active: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{ backgroundImage: NOISE, backgroundSize: "220px 220px" }}
      animate={active ? { opacity: [0.05, 0.11, 0.06, 0.13, 0.07] } : { opacity: 0 }}
      transition={
        active
          ? { duration: 0.55, repeat: Infinity, ease: "linear" }
          : { duration: 0.25, ease: "easeOut" }
      }
    />
  );
}
