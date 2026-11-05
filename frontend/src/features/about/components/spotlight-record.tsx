"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import type { Spotlight } from "../making-of/making-of-types";

const VISIBLE_RECORDS = 6;

/**
 * One film with its record at all four awards side by side — CineRoll's point,
 * shown. Tabs pick an award (arrow keys move between them); the panel
 * crossfades to that award's nominations and wins, or says plainly there are
 * none on record.
 */
export function SpotlightRecord({ spotlight }: { spotlight: Spotlight }) {
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
    <div className="grid gap-8 md:grid-cols-[13rem_1fr] md:gap-12">
      <Link
        href={`/film/${spotlight.slug}`}
        className="group block w-40 self-start md:w-full focus-visible:outline-none"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-accent">
          {spotlight.posterUrl && (
            <Image
              src={spotlight.posterUrl}
              alt=""
              fill
              sizes="208px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
            />
          )}
        </div>
        <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-fg-hi transition-colors group-hover:text-accent-soft">
          {spotlight.title}
        </p>
        <p className="mt-1 text-sm text-fg-faint">{spotlight.year} · open its page →</p>
      </Link>

      <div>
        <div
          role="tablist"
          aria-label={`${spotlight.title} at each award`}
          onKeyDown={onKeyDown}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
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
                className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  selected
                    ? "border-accent/60 bg-accent/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <span className={`block text-sm font-medium ${selected ? "text-fg-hi" : "text-fg-dim"}`}>
                  {entry.name}
                </span>
                <span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-muted">
                  {entry.nominations > 0 ? (
                    <>
                      <span className={entry.wins > 0 ? "text-gold" : ""}>{entry.wins} won</span> ·{" "}
                      {entry.nominations} nom.
                    </>
                  ) : (
                    "No record"
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="mt-5 min-h-[14rem] rounded-xl border border-white/10 bg-[#0b0b12] p-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={body.key}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              {body.records.length === 0 ? (
                <p className="text-sm leading-6 text-fg-faint">
                  {spotlight.title} has no {body.name} nomination on record.
                </p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {body.records.slice(0, VISIBLE_RECORDS).map((record) => (
                    <li
                      key={`${record.category}-${record.year}`}
                      className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                    >
                      <span className="text-fg-dim">
                        {record.category}
                        <span className="ml-2 font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-faint">
                          {record.year}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] ${
                          record.won ? "text-gold" : "text-fg-faint"
                        }`}
                      >
                        {record.won ? "Won" : "Nominated"}
                      </span>
                    </li>
                  ))}
                  {body.records.length > VISIBLE_RECORDS && (
                    <li className="pt-3 text-xs text-fg-muted">
                      {`+${body.records.length - VISIBLE_RECORDS} more on the film’s page`}
                    </li>
                  )}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
