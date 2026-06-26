"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* Shared reduced-motion hook — every animation in this file defers to it. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Count-up — animates to the value the first time it scrolls into view */
/* ------------------------------------------------------------------ */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1200,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  // Seed with the final value so SSR / no-JS shows the real number (no hydration drift).
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    // display is already seeded with the final value, so reduced-motion is a no-op.
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        setDisplay(0);
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          setDisplay(value * eased);
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, durationMs, reduced]);

  const formatted =
    prefix +
    display.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero record reel — slow-fading rotation through the headline records */
/* ------------------------------------------------------------------ */
export type ReelItem = {
  eyebrow: string;
  title: string;
  value: string;
  sub: string;
  href: string;
  accent: "red" | "blue" | "gold";
};

const ACCENT_TEXT: Record<ReelItem["accent"], string> = {
  red: "text-[#ff766d]",
  blue: "text-[#78b7ff]",
  gold: "text-[#f2d86f]",
};

export function HeroRecordReel({ items, intervalMs = 4200 }: { items: ReelItem[]; intervalMs?: number }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused || items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(id);
  }, [reduced, paused, items.length, intervalMs]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-xl border border-[#e8453c]/25 bg-[#100b10] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:p-7"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <style>{`
        @keyframes reelEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 80% 0%, rgba(232,69,60,0.18), transparent 60%)",
        }}
      />
      <Link
        href={item.href}
        className="relative flex items-start justify-between gap-4"
        aria-label={`${item.eyebrow}: ${item.title}`}
      >
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#ff766d]">
          {item.eyebrow}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-[#ff766d] transition-colors group-hover:bg-[#e8453c] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div
        key={index}
        className="relative mt-4"
        style={reduced ? undefined : { animation: "reelEnter 600ms ease-out" }}
      >
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.05] text-[#f4f0f7] sm:text-4xl">
          {item.title}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className={cn("font-[family-name:var(--font-display)] text-5xl font-bold leading-none sm:text-6xl", ACCENT_TEXT[item.accent])}>
            {item.value}
          </p>
          <p className="pb-1 text-right font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#a7a4b8]">
            {item.sub}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-2" role="tablist" aria-label="Featured records">
        {items.map((entry, i) => (
          <button
            key={entry.eyebrow}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={entry.eyebrow}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-7 bg-[#e8453c]" : "w-2.5 bg-white/20 hover:bg-white/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Decade timeline — bars on the left, a live detail panel on the right */
/* ------------------------------------------------------------------ */
export type DecadeDatum = {
  decade: number;
  filmCount: number;
  avgNominations: number;
  topFilm: { title: string; slug: string; count: number } | null;
  href: string;
};

export function DecadeTimeline({ decades, peakDecade }: { decades: DecadeDatum[]; peakDecade: number }) {
  const [active, setActive] = useState(peakDecade);
  const max = Math.max(...decades.map((d) => d.filmCount), 1);
  const current = decades.find((d) => d.decade === active) ?? decades[decades.length - 1];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,260px)]">
      <ul className="space-y-2.5">
        {decades.map((d) => {
          const isActive = d.decade === current?.decade;
          const isPeak = d.decade === peakDecade;
          return (
            <li key={d.decade}>
              <Link
                href={d.href}
                onMouseEnter={() => setActive(d.decade)}
                onFocus={() => setActive(d.decade)}
                className="group grid grid-cols-[52px_minmax(0,1fr)_64px] items-center gap-3 rounded-md px-1.5 py-1 outline-none transition-colors"
              >
                <span
                  className={cn(
                    "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] transition-colors",
                    isActive ? "text-[#f4f0f7]" : "text-[#a9a5bc]",
                  )}
                >
                  {d.decade}s
                </span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full transition-[width,background-color] duration-300"
                    style={{
                      width: `${Math.max(4, (d.filmCount / max) * 100)}%`,
                      backgroundColor: isActive ? "#ff625a" : isPeak ? "#e8453c" : "#9a3b37",
                    }}
                  />
                </span>
                <span
                  className={cn(
                    "text-right font-[family-name:var(--font-geist-mono)] text-[11px] transition-colors",
                    isActive ? "text-[#f4f0f7]" : "text-[#9e9ab0]",
                  )}
                >
                  {d.filmCount.toLocaleString()}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {current && (
        <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[#f4f0f7]">
                {current.decade}s
              </p>
              {current.decade === peakDecade && (
                <span className="rounded-full border border-[#e8453c]/40 bg-[#e8453c]/10 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.14em] text-[#ff766d]">
                  Peak era
                </span>
              )}
            </div>
            <dl className="mt-4 space-y-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#9e9ab0]">Films</dt>
                <dd className="text-[#f4f0f7]">{current.filmCount.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#9e9ab0]">Avg noms</dt>
                <dd className="text-[#f4f0f7]">{current.avgNominations.toFixed(1)}</dd>
              </div>
            </dl>
          </div>
          {current.topFilm && (
            <Link
              href={`/film/${current.topFilm.slug}`}
              className="group mt-4 block border-t border-white/10 pt-3"
            >
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#9e9ab0]">
                Most nominated
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#eeeaf6] transition-colors group-hover:text-white">
                {current.topFilm.title}
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#ff766d]">
                {current.topFilm.count} nominations
              </p>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
