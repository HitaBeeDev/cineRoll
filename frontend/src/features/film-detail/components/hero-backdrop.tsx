"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * The hero image, slowly pushing in and hanging back as the page scrolls.
 *
 * Two effects, one picture. The push-in is a Ken Burns move — a still that is
 * imperceptibly alive, at a rate you notice only by looking away and back. The
 * lag is parallax: the image travels at a fraction of the page's speed, so the
 * title slides off it rather than with it, and the hero reads as something the
 * text is sitting in front of rather than glued to.
 *
 * Nested rather than combined, because the scroll lag is a bound motion value
 * and the push-in is a keyframe loop; on one element they would both be writing
 * the same transform.
 */
export function HeroBackdrop({
  src,
  blurDataURL,
  className,
}: {
  src: string;
  blurDataURL: string;
  className: string;
}) {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  // Only across the first screen of scroll — past that the hero is gone and
  // there is nothing left to lag behind.
  const y = useTransform(scrollY, [0, 800], [0, reducedMotion ? 0 : 150]);

  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <motion.div
        // Overscanned, so the push-in never pulls an edge into view.
        className="absolute -inset-[4%]"
        animate={reducedMotion ? {} : { scale: [1, 1.08] }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 26, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
        }
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurDataURL}
          className={className}
        />
      </motion.div>
    </motion.div>
  );
}
