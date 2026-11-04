"use client";

import { useEffect, useRef } from "react";
import { useAnimate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { StandbyMarqueeRow } from "@/components/home/empty-states/standby-marquee-row";

/** Slow horizontal ticker of award-winner titles — the "tonight's lineup" feel.
 *  Loops seamlessly (two copies, translate −50%); static when reduced motion.
 *  The titles are links, so the loop pauses while hovered or focused — nobody
 *  should have to chase a moving target to click it. */
export function StandbyMarquee() {
  const prefersReduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const fade =
    "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)";

  useEffect(() => {
    if (prefersReduced || !scope.current) return;
    controls.current = animate(
      scope.current,
      { x: ["0%", "-50%"] },
      { duration: 30, ease: "linear", repeat: Infinity },
    );
    return () => controls.current?.stop();
  }, [animate, prefersReduced, scope]);

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

  const pause = () => controls.current?.pause();
  const play = () => controls.current?.play();

  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocus={pause}
      onBlur={play}
    >
      <div ref={scope} className="flex w-max">
        <StandbyMarqueeRow />
        <StandbyMarqueeRow ariaHidden />
      </div>
    </div>
  );
}
