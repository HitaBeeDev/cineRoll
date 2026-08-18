"use client";

import { useSpring, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useState, type PointerEvent } from "react";

type PointerTilt = {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
};

/**
 * A small parallax lean toward the cursor, for a surface that should feel like
 * an object rather than a panel.
 *
 * Deliberately shallow. Past about three degrees the type on a rotated surface
 * starts to soften — the browser is rasterising text on a plane that is no
 * longer parallel to the screen — and a card you tilt is a card you are also
 * trying to read. It is the suggestion of depth, not a demonstration of it.
 *
 * Off entirely without a fine pointer: on touch there is no hover to lean into,
 * and the handlers would only fire on the way to a tap.
 */
export function usePointerTilt({
  maxDegrees = 2.5,
  disabled = false,
}: { maxDegrees?: number; disabled?: boolean } = {}): PointerTilt {
  const [finePointer, setFinePointer] = useState(false);
  const rotateX = useSpring(0, { stiffness: 210, damping: 22, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 210, damping: 22, mass: 0.6 });

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const active = finePointer && !disabled;

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!active) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      const fromCentreX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const fromCentreY = (event.clientY - bounds.top) / bounds.height - 0.5;
      rotateY.set(fromCentreX * maxDegrees * 2);
      rotateX.set(-fromCentreY * maxDegrees * 2);
    },
    [active, maxDegrees, rotateX, rotateY],
  );

  const onPointerLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { rotateX, rotateY, onPointerMove, onPointerLeave };
}
