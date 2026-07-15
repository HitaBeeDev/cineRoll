import type { Variants } from "framer-motion";

export const CAROUSEL_VISIBLE_COUNT = 2;

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

export const FADE_VARIANTS: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};
