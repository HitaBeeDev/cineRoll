"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { MatchExample } from "../making-of/making-of-types";

const MONO_LABEL =
  "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-faint";
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The matching step, played once when it scrolls into view: the two names a
 * film is known by slide in, two lines draw down from them and meet, and the
 * single TMDB record appears with its combined award counts. The end state
 * stays on screen; with reduced motion it is shown directly.
 */
export function MatchMerge({ match }: { match: MatchExample }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduceMotion = useReducedMotion();
  const play = inView || reduceMotion === true;
  const timing = (delay: number, duration = 0.5) =>
    reduceMotion ? { duration: 0 } : { delay, duration, ease: EASE };

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-[#0b0b12] p-6 sm:p-8">
      <p className={MONO_LABEL}>A real match</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { label: "Original title", value: match.originalTitle, from: -16 },
          { label: "English title", value: match.title, from: 16 },
        ].map((name, index) => (
          <motion.div
            key={name.label}
            className="rounded-lg border border-white/10 px-4 py-3"
            initial={{ opacity: 0, x: name.from }}
            animate={play ? { opacity: 1, x: 0 } : {}}
            transition={timing(index * 0.1)}
          >
            <p className={MONO_LABEL}>{name.label}</p>
            <p className="mt-1 font-medium text-fg-hi">{name.value}</p>
          </motion.div>
        ))}
      </div>

      <svg aria-hidden viewBox="0 0 200 40" preserveAspectRatio="none" className="h-10 w-full text-accent">
        {["M50 0 C50 22 100 18 100 40", "M150 0 C150 22 100 18 100 40"].map((d) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={play ? { pathLength: 1, opacity: 1 } : {}}
            transition={timing(0.35, 0.7)}
          />
        ))}
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -6 }}
        animate={play ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={timing(1.0)}
      >
        <Link
          href={`/film/${match.slug}`}
          className="group flex items-center gap-4 rounded-xl border border-accent/50 bg-accent/[0.07] p-3 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {match.posterUrl && (
            <span className="relative block aspect-[2/3] w-14 shrink-0 overflow-hidden rounded">
              <Image src={match.posterUrl} alt="" fill sizes="56px" className="object-cover" />
            </span>
          )}
          <span className="min-w-0">
            <span className={MONO_LABEL}>One record</span>
            <span className="mt-0.5 block font-medium text-fg-hi group-hover:text-accent-soft">{match.title}</span>
            {match.tmdbId && (
              <span className="mt-0.5 block font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-muted">
                TMDB #{match.tmdbId}
              </span>
            )}
          </span>
        </Link>
      </motion.div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {match.bodies.map((body, index) => (
          <motion.li
            key={body.name}
            className="rounded-lg bg-white/[0.03] px-3 py-2"
            initial={{ opacity: 0, y: 6 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={timing(1.3 + index * 0.08, 0.35)}
          >
            <p className={MONO_LABEL}>{body.name}</p>
            <p className="mt-1 text-sm tabular-nums text-fg-dim">
              {body.nominations > 0 ? (
                <>
                  <span className={body.wins > 0 ? "text-gold" : ""}>{body.wins} won</span> / {body.nominations} nom.
                </>
              ) : (
                <span className="text-fg-faint">—</span>
              )}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
