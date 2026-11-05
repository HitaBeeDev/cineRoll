"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import type { Spotlight } from "../making-of/making-of-types";

const VISIBLE_RECORDS = 4;

/**
 * Award tabs for the spotlight film. The selected state is a filled pill that
 * slides between tabs; the panel keeps one fixed height and truly crossfades
 * (old and new records overlap in the same grid cell, nothing jumps). Arrow
 * keys move between tabs.
 */
export function SpotlightTabs({ spotlight }: { spotlight: Spotlight }) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const firstWithRecords = spotlight.bodies.findIndex((body) => body.records.length > 0);
  const [active, setActive] = useState(Math.max(firstWithRecords, 0));
  const body = spotlight.bodies[active];
  if (!body) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + spotlight.bodies.length) % spotlight.bodies.length;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={`${spotlight.title} at each award`}
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/30 p-1 sm:grid-cols-4"
      >
        {spotlight.bodies.map((entry, index) => {
          const selected = index === active;
          return (
            <button
              key={entry.key}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className="relative rounded-xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {selected && (
                <motion.span
                  layoutId={`${baseId}-indicator`}
                  aria-hidden
                  className="absolute inset-0 rounded-xl bg-accent shadow-[0_8px_30px_rgba(232,69,60,0.35)]"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span
                className={`relative block text-sm font-semibold transition-colors ${selected ? "text-white" : "text-fg-dim"}`}
              >
                {entry.name}
              </span>
              <span
                className={`relative mt-0.5 block font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums transition-colors ${selected ? "text-white/85" : "text-fg-muted"}`}
              >
                {entry.nominations > 0 ? `${entry.wins} won · ${entry.nominations} nom.` : "No record"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-4 grid h-[17rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/80 p-5 backdrop-blur-sm"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={body.key}
            className="col-start-1 row-start-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeInOut" }}
          >
            {body.records.length === 0 ? (
              <p className="my-auto text-center text-sm leading-6 text-fg-faint">
                {spotlight.title} has no {body.name} nomination on record.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {body.records.slice(0, VISIBLE_RECORDS).map((record) => (
                  <li
                    key={`${record.category}-${record.year}`}
                    className="flex items-baseline justify-between gap-4 py-3 text-[15px]"
                  >
                    <span className="min-w-0 truncate text-fg-hi">
                      {record.category}
                      <span className="ml-2 font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-faint">
                        {record.year}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] ${
                        record.won ? "bg-gold/15 text-gold" : "text-fg-faint"
                      }`}
                    >
                      {record.won ? "Won" : "Nominated"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/film/${spotlight.slug}`}
              className="mt-auto self-start pt-3 text-sm text-fg-muted underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
            >
              View all records →
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
