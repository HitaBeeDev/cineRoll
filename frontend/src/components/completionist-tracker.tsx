"use client";

import type {
  CompletionCategoryKey,
  CompletionProgress,
} from "@cineroll/types";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const BROWSE_FILTERS: Record<CompletionCategoryKey, string> = {
  oscar: "awardBody=oscar",
  goldenglobe: "awardBody=goldenglobe",
  cannes: "awardBody=cannes",
  berlin: "awardBody=berlin",
  "imdb-movies": "imdbTopMoviesOnly=true",
  "imdb-tv": "imdbTopTvOnly=true",
};

export function CompletionistTracker({ progress }: { progress: CompletionProgress }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mt-16" aria-labelledby="completionist-heading">
      <div className="flex flex-col gap-4 border-b border-[#1e1e2a] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8453c]">
            Completionist
          </p>
          <h2
            id="completionist-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]"
          >
            Your archive progress
          </h2>
          <p className="mt-2 max-w-xl font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
            Every film you mark watched moves you closer to completing the collection.
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <span className="font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums text-[#F5F5F0]">
            {formatPercentage(progress.overall.percentage)}
          </span>
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#77778b]">
            {progress.overall.watched.toLocaleString()} of {progress.overall.total.toLocaleString()} watched
          </p>
        </div>
      </div>

      <ProgressBar
        percentage={progress.overall.percentage}
        reduceMotion={reduceMotion ?? false}
        className="mt-5 h-2"
      />

      <div className="mt-7 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {progress.categories.map((category, index) => (
          <Link
            key={category.key}
            href={`/browse?${BROWSE_FILTERS[category.key]}`}
            className="group -mx-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#0d0d1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            aria-label={`Browse ${category.label}: ${category.watched} of ${category.total} watched`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold text-[#c8c8d2] transition-colors group-hover:text-[#F5F5F0]">
                {category.label}
              </span>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums text-[#77778b]">
                {category.watched.toLocaleString()} / {category.total.toLocaleString()}
                <span className="ml-2 text-[#e8453c]" aria-hidden>→</span>
              </span>
            </div>
            <ProgressBar
              percentage={category.percentage}
              reduceMotion={reduceMotion ?? false}
              delay={index * 0.06}
              className="mt-2.5 h-1.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProgressBar({
  percentage,
  reduceMotion,
  delay = 0,
  className,
}: {
  percentage: number;
  reduceMotion: boolean;
  delay?: number;
  className: string;
}) {
  const width = `${Math.min(100, Math.max(0, percentage))}%`;

  return (
    <div className={`overflow-hidden rounded-full bg-[#171722] ${className}`} aria-hidden>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#9e2924] to-[#e8453c]"
        initial={reduceMotion ? { width } : { width: 0 }}
        whileInView={{ width }}
        viewport={{ once: true, amount: 0.5 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function formatPercentage(value: number): string {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}
