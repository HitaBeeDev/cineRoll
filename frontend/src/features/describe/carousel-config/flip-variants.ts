import type { Variants } from "framer-motion";

export const FLIP_VARIANTS: Variants = {
  enter: (direction: number) => ({
    rotateY: direction >= 0 ? 78 : -78,
    opacity: 0,
  }),
  center: { rotateY: 0, opacity: 1 },
  exit: (direction: number) => ({
    rotateY: direction >= 0 ? -78 : 78,
    opacity: 0,
  }),
};
