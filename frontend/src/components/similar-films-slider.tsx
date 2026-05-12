"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/film-card";
import type { Film } from "@cineroll/types";

const CARD_W = 208; // w-52
const GAP = 12;     // gap-3
const STEP = CARD_W + GAP;

export function SimilarFilmsSlider({ films }: { films: Film[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  // left/right Framer drag constraints (x values)
  const [bounds, setBounds] = useState({ left: 0, right: 0 });

  // true while a drag gesture is in flight — blocks the link click that follows
  const dragging = useRef(false);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const trackW = films.length * STEP - GAP;
    const visible = containerRef.current.offsetWidth;
    const overflow = Math.max(0, trackW - visible);
    setBounds({ left: -overflow, right: 0 });
    setMaxIndex(Math.ceil(overflow / STEP));
  }, [films.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxIndex));
    setIndex(clamped);
    controls.start({
      x: -clamped * STEP,
      transition: { type: "spring", stiffness: 320, damping: 38 },
    });
  };

  const onDragEnd = () => {
    // block the subsequent click for 80 ms
    setTimeout(() => { dragging.current = false; }, 80);

    const current = x.get();
    const clamped = Math.max(bounds.left, Math.min(bounds.right, current));
    const snapped = Math.round(clamped / STEP) * STEP;
    const newIdx = Math.max(0, Math.min(Math.round(-snapped / STEP), maxIndex));
    setIndex(newIdx);
    controls.start({
      x: snapped,
      transition: { type: "spring", stiffness: 320, damping: 38 },
    });
  };

  return (
    // "group/slider" is a *named* group — keeps its group-hover scoped and
    // doesn't bleed into the unnamed "group" inside each FilmCard
    <div className="group/slider relative" ref={containerRef}>
      {/* Prev */}
      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous"
        className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-[#07070b] via-[#07070b]/60 to-transparent text-[#444458] opacity-0 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover/slider:opacity-100 disabled:!opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={bounds}
          dragElastic={0.07}
          dragMomentum={false}
          style={{ x }}
          animate={controls}
          onDragStart={() => { dragging.current = true; }}
          onDragEnd={onDragEnd}
          className="flex cursor-grab gap-3 pb-3 active:cursor-grabbing"
        >
          {films.map((f) => (
            <div
              key={f.id}
              className="w-52 flex-shrink-0"
              onClickCapture={(e) => {
                if (dragging.current) {
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

      {/* Next */}
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
