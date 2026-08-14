"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type CountUpProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1200,
  className,
}: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    // The ramp is an entrance flourish: it runs once, the first time the number
    // comes into view, and never again. Everything that happens afterwards —
    // scrolling back past the card, or a value that moves (the completionist
    // percentage rises as films are marked watched) — jumps straight to the real
    // number, because a replay puts figures on screen that were never true.
    if (reduced || startedRef.current) {
      setDisplay(value);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        startedRef.current = true;
        observer.disconnect();
        animateCount(value, durationMs, setDisplay, frameRef);
      },
      { threshold: 0.35 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, reduced]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={elementRef} className={className}>{prefix}{formatted}{suffix}</span>;
}

function animateCount(
  value: number,
  durationMs: number,
  setDisplay: React.Dispatch<React.SetStateAction<number>>,
  frameRef: React.RefObject<number>,
): void {
  const start = performance.now();
  setDisplay(0);
  // Every frame handle goes through the ref, so an unmount mid-ramp cancels the
  // loop instead of leaving it running against a gone component.
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    setDisplay(value * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    else setDisplay(value);
  };
  frameRef.current = requestAnimationFrame(tick);
}
