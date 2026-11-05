"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DemoFilm } from "../making-of/making-of-types";
import { useRolledFilm } from "../making-of/use-rolled-film";

// Frame gaps for the shuffle, in ms: fast at first, then slowing like a reel
// coasting to a stop before the pick settles.
const SHUFFLE_GAPS = [55, 60, 70, 80, 95, 115, 140, 175, 220];

function randomOther(pool: DemoFilm[], current: number): number {
  if (pool.length < 2) return current;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * pool.length);
  return next;
}

/**
 * A working miniature of CineRoll: press Roll, posters flick past and slow
 * down, one award winner settles with its top-prize badges. Real films, real
 * records. The first film is server-rendered so the demo is never empty.
 */
export function RollDemo({ pool }: { pool: DemoFilm[] }) {
  const reduceMotion = useReducedMotion();
  const { setFilm } = useRolledFilm();
  const [shown, setShown] = useState(0);
  const [rolling, setRolling] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const film = pool[shown];
  if (!film) return null;

  const roll = () => {
    if (rolling) return;
    const target = randomOther(pool, shown);
    const settle = () => {
      setShown(target);
      setRolling(false);
      const picked = pool[target];
      if (picked) setFilm(picked);
    };
    if (reduceMotion) {
      settle();
      return;
    }
    setRolling(true);
    let elapsed = 0;
    let frame = shown;
    for (const gap of SHUFFLE_GAPS) {
      elapsed += gap;
      timers.current.push(
        setTimeout(() => {
          frame = randomOther(pool, frame);
          setShown(frame);
        }, elapsed),
      );
    }
    timers.current.push(setTimeout(settle, elapsed + 260));
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent opacity-[0.14] blur-[90px]"
      />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/90 shadow-[0_40px_90px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em]">
          <span className="flex items-center gap-1.5 font-bold text-[#ff554c]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Cine·Roll
          </span>
          <span className="text-fg-faint">Live demo</span>
        </div>

        <div className="flex flex-col items-center px-6 pb-5 pt-5">
          <div className="relative aspect-[2/3] w-36 sm:w-40">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={`${shown}-${rolling ? "r" : "s"}`}
                className="absolute inset-0 overflow-hidden rounded-lg shadow-[0_18px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
                initial={rolling ? { y: -24, opacity: 0.4 } : { scale: 0.92, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1, filter: rolling ? "blur(1.5px)" : "blur(0px)" }}
                exit={rolling ? { y: 24, opacity: 0 } : { opacity: 0 }}
                transition={
                  rolling
                    ? { duration: 0.09, ease: "linear" }
                    : { type: "spring", stiffness: 260, damping: 22 }
                }
              >
                <Image src={film.posterUrl} alt="" fill sizes="192px" className="object-cover" priority />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 min-h-[5rem] w-full text-center" aria-live="polite">
            {rolling ? (
              <p className="pt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-fg-faint">
                Rolling…
              </p>
            ) : (
              <motion.div
                key={film.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-fg-hi">
                  {film.title}
                </p>
                <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {film.badges.slice(0, 3).map((badge, index) => (
                    <motion.li
                      key={`${badge.body}-${badge.year}`}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.12 + index * 0.08, duration: 0.25 }}
                      className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] text-gold"
                    >
                      {badge.prize} · {badge.body} {badge.year}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <div className="mt-3 flex w-full items-center justify-center gap-2">
            <button
              type="button"
              onClick={roll}
              disabled={rolling}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(232,69,60,0.35)] transition-colors hover:bg-accent-hi disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              {rolling ? "Rolling…" : "Roll"}
            </button>
            <Link
              href={`/film/${film.slug}`}
              aria-disabled={rolling}
              tabIndex={rolling ? -1 : undefined}
              className={`rounded-full border border-white/15 px-5 py-2.5 text-sm text-fg-hi transition-colors hover:border-accent/60 hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${rolling ? "pointer-events-none opacity-40" : ""}`}
            >
              Open film →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
