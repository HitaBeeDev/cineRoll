"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/film-card";
import type { Film } from "@cineroll/types";

const CARD_W = 208; // w-52
const GAP = 12;     // gap-3
const STEP = CARD_W + GAP;
const SPRING = { type: "spring", stiffness: 320, damping: 38 } as const;

export function SimilarFilmsSlider({ films }: { films: Film[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const [index, setIndex] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  // pointer-tracking refs (no re-renders needed)
  const pointerStartX = useRef(0);
  const motionStartX = useRef(0);
  const active = useRef(false);
  const didMove = useRef(false);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const trackW = films.length * STEP - GAP;
    const overflow = Math.max(0, trackW - containerRef.current.offsetWidth);
    setMaxOffset(overflow);
    setMaxIndex(Math.ceil(overflow / STEP));
  }, [films.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const springTo = useCallback((target: number) => {
    animate(x, target, SPRING);
  }, [x]);

  const goTo = (next: number) => {
    const i = Math.max(0, Math.min(next, maxIndex));
    setIndex(i);
    springTo(-i * STEP);
  };

  /* ── pointer handlers ─────────────────────────────────────────────── */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    // stop any in-flight spring so the track follows the finger immediately
    x.stop();
    pointerStartX.current = e.clientX;
    motionStartX.current = x.get();
    active.current = true;
    didMove.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    const delta = e.clientX - pointerStartX.current;
    if (Math.abs(delta) > 4) didMove.current = true;

    const raw = motionStartX.current + delta;
    // rubber-band resistance past each end
    const damped =
      raw > 0          ? raw * 0.15
      : raw < -maxOffset ? -maxOffset + (raw + maxOffset) * 0.15
      : raw;

    x.set(damped);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    active.current = false;

    const delta = e.clientX - pointerStartX.current;
    const cur = x.get();
    // bias snap direction by drag direction when user moved meaningfully
    const raw = -cur / STEP;
    let snapped =
      Math.abs(delta) > 40
        ? delta < 0 ? Math.ceil(raw) : Math.floor(raw)
        : Math.round(raw);
    snapped = Math.max(0, Math.min(snapped, maxIndex));
    setIndex(snapped);
    springTo(-snapped * STEP);
  };

  return (
    <div className="group/slider relative select-none" ref={containerRef}>
      {/* ── Prev ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous"
        className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-[#07070b] via-[#07070b]/60 to-transparent text-[#444458] opacity-0 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover/slider:opacity-100 disabled:!opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* ── Track ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <motion.div
          style={{ x }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex cursor-grab gap-3 pb-3 active:cursor-grabbing"
        >
          {films.map((f) => (
            <div
              key={f.id}
              className="w-52 flex-shrink-0"
              onClickCapture={(e) => {
                // block the click that the browser fires after a drag gesture
                if (didMove.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <FilmCard film={f} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Next ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => goTo(index + 1)}
        disabled={index >= maxIndex}
        aria-label="Next"
        className="absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-l from-[#07070b] via-[#07070b]/60 to-transparent text-[#444458] opacity-0 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover/slider:opacity-100 disabled:!opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
