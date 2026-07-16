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

  useEffect(() => {
    if (reduced || !elementRef.current) return;
    const observer = createCountObserver(value, durationMs, startedRef, setDisplay);
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [value, durationMs, reduced]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={elementRef} className={className}>{prefix}{formatted}{suffix}</span>;
}

function createCountObserver(
  value: number,
  durationMs: number,
  startedRef: React.RefObject<boolean>,
  setDisplay: React.Dispatch<React.SetStateAction<number>>,
): IntersectionObserver {
  return new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting || startedRef.current) return;
    startedRef.current = true;
    animateCount(value, durationMs, setDisplay);
  }, { threshold: 0.35 });
}

function animateCount(
  value: number,
  durationMs: number,
  setDisplay: React.Dispatch<React.SetStateAction<number>>,
): void {
  const start = performance.now();
  setDisplay(0);
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    setDisplay(value * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(tick);
    else setDisplay(value);
  };
  requestAnimationFrame(tick);
}
