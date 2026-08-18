"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * A soft light that follows the cursor across the control panel.
 *
 * It listens on its own parent rather than taking a prop, so the panel it lights
 * does not have to know it exists — no handlers threaded through the layout, no
 * pointer state re-rendering a tree of filter controls on every mouse move. The
 * position is a spring on two motion values, so nothing above it re-renders at
 * all while the light moves.
 *
 * Behind the content at `-z-10` and never taking pointer events: it is the room
 * the controls sit in, not a layer over them.
 */
export function HeroSpotlight() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 130, damping: 26, mass: 0.6 });
  const y = useSpring(0, { stiffness: 130, damping: 26, mass: 0.6 });
  const opacity = useSpring(0, { stiffness: 90, damping: 26 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const host = anchorRef.current?.parentElement;
    if (!host) return;
    // No hover, no spotlight — on touch the handlers would only ever fire on the
    // way to a tap, leaving a light stranded wherever the finger left.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const track = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      x.set(event.clientX - bounds.left);
      y.set(event.clientY - bounds.top);
      opacity.set(1);
    };
    const dim = () => opacity.set(0);

    host.addEventListener("pointermove", track);
    host.addEventListener("pointerleave", dim);
    return () => {
      host.removeEventListener("pointermove", track);
      host.removeEventListener("pointerleave", dim);
    };
  }, [reducedMotion, x, y, opacity]);

  if (reducedMotion) return null;

  return (
    <div ref={anchorRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute left-0 top-0" style={{ x, y, opacity }}>
        <div className="h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,69,60,0.14),rgba(232,69,60,0.05)_42%,transparent_68%)]" />
      </motion.div>
    </div>
  );
}
