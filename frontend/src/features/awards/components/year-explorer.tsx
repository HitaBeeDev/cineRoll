"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { YearRow } from "../hub/hub-types";
import { YearCellCard } from "./year-cell-card";
import { YearRuler } from "./year-ruler";

const STEP_BUTTON_CLASS =
  "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-fg-dim transition-colors hover:border-accent/60 hover:text-fg-hi disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

/** The newest year where at least one award has a top-prize winner. */
function latestWithWinners(rows: YearRow[]): number {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (row?.cells.some((cell) => cell.status === "winners")) return row.year;
  }
  return rows.at(-1)?.year ?? 0;
}

/**
 * "Explore a year": pick a year on the ruler (or the select on phones, or the
 * step buttons) and see each award's top-prize winner for it, with posters and
 * links to the film and the full ceremony. Results crossfade on change; the
 * first year is server-rendered, so its links are in the HTML.
 */
export function YearExplorer({ rows }: { rows: YearRow[] }) {
  const reduceMotion = useReducedMotion();
  const [year, setYear] = useState(() => latestWithWinners(rows));
  const first = rows[0]?.year;
  const last = rows.at(-1)?.year;
  if (first === undefined || last === undefined) return null;

  const row = rows.find((entry) => entry.year === year) ?? rows.at(-1);
  const setClamped = (next: number) => setYear(Math.min(last, Math.max(first, next)));

  return (
    <section aria-labelledby="explore-year" className="relative">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent">
            Explore a year
          </p>
          <h2
            id="explore-year"
            className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-fg-hi sm:text-4xl"
          >
            What won in{" "}
            <span className="tabular-nums text-accent-soft" aria-live="polite">
              {year}
            </span>
            ?
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={STEP_BUTTON_CLASS}
            onClick={() => setClamped(year - 1)}
            disabled={year <= first}
            aria-label="Previous year"
          >
            ←
          </button>
          <label className="sm:hidden">
            <span className="sr-only">Choose a year</span>
            <select
              value={year}
              onChange={(event) => setClamped(Number(event.target.value))}
              className="h-10 rounded-full border border-white/15 bg-[#0b0b12] px-4 font-[family-name:var(--font-geist-mono)] text-sm tabular-nums text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {[...rows].reverse().map((entry) => (
                <option key={entry.year} value={entry.year}>
                  {entry.year}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={STEP_BUTTON_CLASS}
            onClick={() => setClamped(year + 1)}
            disabled={year >= last}
            aria-label="Next year"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-8 hidden sm:block">
        <YearRuler first={first} last={last} value={year} onChange={setClamped} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={year}
          className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          {row?.cells.map((cell) => <YearCellCard key={cell.slug} cell={cell} year={year} />)}
        </motion.ul>
      </AnimatePresence>
    </section>
  );
}
