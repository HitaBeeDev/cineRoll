"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/film-card";
import type { Film } from "@cineroll/types";

const CARD_WIDTH = 208; // w-52
const GAP = 12;         // gap-3
const STEP = CARD_WIDTH + GAP;

export function SimilarFilmsSlider({ films }: { films: Film[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const trackW = films.length * STEP - GAP;
      const visible = container.offsetWidth;
      const maxOffset = Math.max(0, trackW - visible);
      const steps = Math.ceil(maxOffset / STEP);
      setMaxIndex(steps);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [films.length]);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxIndex));
    setIndex(clamped);
    controls.start({
      x: -clamped * STEP,
      transition: { type: "spring", stiffness: 300, damping: 35 },
    });
  };

  const clampDrag = () => {
    const container = containerRef.current;
    if (!container) return { min: 0, max: 0 };
    const trackW = films.length * STEP - GAP;
    const visible = container.offsetWidth;
    return { min: -(trackW - visible), max: 0 };
  };

  const onDragEnd = () => {
    const { min, max } = clampDrag();
    const current = x.get();
    const clamped = Math.max(min, Math.min(max, current));
    const snapped = Math.round(clamped / STEP) * STEP;
    const newIndex = Math.max(0, Math.min(-snapped / STEP, maxIndex));
    setIndex(Math.round(newIndex));
    controls.start({
      x: snapped,
      transition: { type: "spring", stiffness: 300, damping: 35 },
    });
  };

  const { min: dragMin, max: dragMax } = clampDrag();

  return (
    <div className="group relative" ref={containerRef}>
      {/* Prev */}
      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous"
        className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-[#07070b] via-[#07070b]/60 to-transparent text-[#444458] opacity-0 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover:opacity-100 disabled:opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Overflow mask */}
      <div className="overflow-hidden">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: dragMin, right: dragMax }}
          dragElastic={0.08}
          style={{ x }}
          animate={controls}
          onDragEnd={onDragEnd}
          className="flex cursor-grab gap-3 pb-3 active:cursor-grabbing"
        >
          {films.map((f) => (
            <div key={f.id} className="w-52 flex-shrink-0">
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
        className="absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-l from-[#07070b] via-[#07070b]/60 to-transparent text-[#444458] opacity-0 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover:opacity-100 disabled:opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
