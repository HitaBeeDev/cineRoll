"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmTile } from "@/components/film-tile";
import type { Film } from "@cineroll/types";

const CARD_W = 208;
const GAP = 12;
const STEP = CARD_W + GAP;
const SPRING = { type: "spring", stiffness: 320, damping: 38 } as const;

export function SimilarFilmsSlider({ films }: { films: Film[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const [index, setIndex] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  const startClientX = useRef(0);
  const startX = useRef(0);
  const active = useRef(false);
  const didMove = useRef(false);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const overflow = Math.max(
      0,
      films.length * STEP - GAP - containerRef.current.offsetWidth,
    );
    setMaxOffset(overflow);
    setMaxIndex(Math.ceil(overflow / STEP));
  }, [films.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const springTo = useCallback(
    (target: number) => animate(x, target, SPRING),
    [x],
  );

  const goTo = (next: number) => {
    const i = Math.max(0, Math.min(next, maxIndex));
    setIndex(i);
    springTo(-i * STEP);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // prevent the browser from starting its native image / link drag
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    x.stop();
    startClientX.current = e.clientX;
    startX.current = x.get();
    active.current = true;
    didMove.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    const delta = e.clientX - startClientX.current;
    if (Math.abs(delta) > 4) didMove.current = true;

    const raw = startX.current + delta;
    // soft rubber-band past either end
    const clamped =
      raw > 0
        ? raw * 0.15
        : raw < -maxOffset
          ? -maxOffset + (raw + maxOffset) * 0.15
          : raw;
    x.set(clamped);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    active.current = false;

    const delta = e.clientX - startClientX.current;
    const raw = -x.get() / STEP;
    // bias toward the drag direction when the gesture was intentional
    let snapped =
      Math.abs(delta) > 40
        ? delta < 0
          ? Math.ceil(raw)
          : Math.floor(raw)
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
        className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-[#07070b] via-[#07070b]/60 to-transparent text-[#6a6a82] opacity-70 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover/slider:opacity-100 disabled:!opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* ── Track ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <motion.div
          style={{ x, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          // belt-and-suspenders: also kill the HTML5 dragstart event that
          // fires on images/links before pointerdown can capture
          onDragStart={(e) => e.preventDefault()}
          className="flex cursor-grab gap-3 pb-3 active:cursor-grabbing"
        >
          {films.map((f) => (
            <div
              key={f.id}
              onClickCapture={(e) => {
                if (didMove.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className="w-52 flex-shrink-0"
            >
              <FilmTile film={f} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Next ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => goTo(index + 1)}
        disabled={index >= maxIndex}
        aria-label="Next"
        className="absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-center bg-gradient-to-l from-[#07070b] via-[#07070b]/60 to-transparent text-[#6a6a82] opacity-70 transition-opacity duration-200 hover:text-[#F5F5F0] group-hover/slider:opacity-100 disabled:!opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
