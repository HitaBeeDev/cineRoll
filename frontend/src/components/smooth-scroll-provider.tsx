"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Inertia-based smooth scroll for the whole document.
 *
 * `lerp` sits at 0.11 deliberately. Lower reads as heavier but starts costing
 * INP: the page keeps gliding after the wheel stops, and a user who scrolled to
 * reach a control waits for it to settle. This is the range where the motion is
 * felt but never argued with.
 *
 * Nested scrollers (the roll result rail, the filter column, dialogs) opt out
 * with `data-lenis-prevent`, or a wheel over them would scroll the page behind
 * instead of the panel under the cursor.
 *
 * Under `prefers-reduced-motion` Lenis is not mounted at all. Unlike Motion it
 * has no internal respect for the preference — smoothing is the whole library,
 * so the only honest way to disable it is to leave it out of the tree.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.11,
        smoothWheel: true,
        // Touch devices already have inertia from the OS, and doubling it up is
        // what makes smooth-scroll libraries feel broken on iOS.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
