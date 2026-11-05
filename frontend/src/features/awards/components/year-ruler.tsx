"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

const STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
};

/**
 * The year ruler as a single slider: one tick per year, taller and labelled
 * every decade/20 years, a coral marker on the selected year. Click or drag to
 * pick; arrows step a year, Page Up/Down a decade, Home/End jump to the ends.
 * One tab stop, announced as a slider — not ninety-eight buttons.
 */
export function YearRuler({
  first,
  last,
  value,
  onChange,
}: {
  first: number;
  last: number;
  value: number;
  onChange: (year: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(last - first, 1);
  const clamp = (year: number) => Math.min(last, Math.max(first, year));
  const percent = (year: number) => ((year - first) / span) * 100;

  const yearAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return value;
    return clamp(Math.round(first + ((clientX - rect.left) / rect.width) * span));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    onChange(yearAt(event.clientX));
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) onChange(yearAt(event.clientX));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key in STEPS) next = clamp(value + (STEPS[event.key] ?? 0));
    else if (event.key === "Home") next = first;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    onChange(next);
  };

  const years = Array.from({ length: span + 1 }, (_, index) => first + index);

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Ceremony year"
        aria-valuemin={first}
        aria-valuemax={last}
        aria-valuenow={value}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        className="relative h-14 cursor-pointer touch-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07070b]"
      >
        <div className="absolute inset-x-0 bottom-0 flex h-10 items-end justify-between">
          {years.map((year) => (
            <span
              key={year}
              className={year % 10 === 0 ? "h-6 w-px bg-white/40" : "h-2.5 w-px bg-white/15"}
            />
          ))}
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 top-1 w-0.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(232,69,60,0.8)] transition-[left] duration-150 ease-out"
          style={{ left: `${percent(value)}%` }}
        >
          <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent" />
        </span>
      </div>
      <div aria-hidden className="relative mt-2 h-5 font-[family-name:var(--font-geist-mono)] text-xs tabular-nums text-fg-muted">
        {years
          .filter((year) => year % 20 === 0)
          .map((year) => (
            <span key={year} className="absolute -translate-x-1/2" style={{ left: `${percent(year)}%` }}>
              {year}
            </span>
          ))}
      </div>
    </div>
  );
}
