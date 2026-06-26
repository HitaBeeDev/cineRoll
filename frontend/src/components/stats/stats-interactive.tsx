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

/* Native anchor for in-page hashes (fires hashchange); next/link otherwise. */
function SmartLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
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
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
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
          const eased = 1 - Math.pow(1 - t, 3);
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
/* Hero record reel                                                    */
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
      className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-xl border border-[#e8453c]/25 bg-[#100b10] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:p-7"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <style>{`@keyframes reelEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 80% 0%, rgba(232,69,60,0.18), transparent 60%)" }}
      />
      <SmartLink
        href={item.href}
        className="relative flex items-start justify-between gap-4"
        ariaLabel={`${item.eyebrow}: ${item.title}`}
      >
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#ff766d]">
          {item.eyebrow}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-[#ff766d] transition-colors group-hover:bg-[#e8453c] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </SmartLink>

      <div key={index} className="relative mt-4" style={reduced ? undefined : { animation: "reelEnter 600ms ease-out" }}>
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.05] text-[#f4f0f7] sm:text-4xl">
          {item.title}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className={cn("font-[family-name:var(--font-display)] text-5xl font-bold leading-none sm:text-6xl", ACCENT_TEXT[item.accent])}>
            {item.value}
          </p>
          <p className="pb-1 text-right font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#b6b2c6]">
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
/* Decade timeline — the dominant, interactive centerpiece            */
/* ------------------------------------------------------------------ */
export type DecadeDatum = {
  decade: number;
  filmCount: number;
  avgNominations: number;
  topFilm: { title: string; slug: string; count: number } | null;
  href: string;
};

export function DecadeTimeline({ decades, peakDecade }: { decades: DecadeDatum[]; peakDecade: number }) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(peakDecade);
  const containerRef = useRef<HTMLDivElement>(null);

  const max = Math.max(...decades.map((d) => d.filmCount), 1);
  const totalFilms = decades.reduce((sum, d) => sum + d.filmCount, 0);
  const avgFilms = decades.length > 0 ? totalFilms / decades.length : 0;
  const current = decades.find((d) => d.decade === active) ?? decades[decades.length - 1];

  // Let the hero (or any #decade-XXXX link) drive selection + scroll here.
  useEffect(() => {
    const applyHash = () => {
      const match = window.location.hash.match(/^#decade-(\d{3,4})$/);
      if (!match) return;
      const dec = Number(match[1]);
      if (!decades.some((d) => d.decade === dec)) return;
      setActive(dec);
      containerRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [decades, reduced]);

  if (!current) return null;

  const vsAvg = avgFilms > 0 ? ((current.filmCount - avgFilms) / avgFilms) * 100 : 0;
  const share = totalFilms > 0 ? (current.filmCount / totalFilms) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="grid scroll-mt-24 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]"
    >
      {/* Bars */}
      <ul className="flex flex-col justify-center gap-3">
        {decades.map((d) => {
          const isActive = d.decade === current.decade;
          const isPeak = d.decade === peakDecade;
          return (
            <li key={d.decade}>
              <button
                type="button"
                aria-pressed={isActive}
                onMouseEnter={() => setActive(d.decade)}
                onFocus={() => setActive(d.decade)}
                onClick={() => setActive(d.decade)}
                className="grid w-full grid-cols-[64px_minmax(0,1fr)_72px] items-center gap-4 rounded-md px-1 py-1 text-left outline-none focus-visible:bg-white/[0.04]"
              >
                <span
                  className={cn(
                    "font-[family-name:var(--font-display)] font-bold transition-all",
                    isActive ? "text-xl text-[#f4f0f7]" : "text-base text-[#a9a5bc]",
                  )}
                >
                  {d.decade}s
                </span>
                <span className="relative h-4 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full transition-[width,background-color] duration-300"
                    style={{
                      width: `${Math.max(4, (d.filmCount / max) * 100)}%`,
                      backgroundColor: isActive ? "#ff625a" : isPeak ? "#e8453c" : "#7e302d",
                    }}
                  />
                </span>
                <span
                  className={cn(
                    "text-right font-[family-name:var(--font-geist-mono)] text-sm tabular-nums transition-colors",
                    isActive ? "text-[#f4f0f7]" : "text-[#b6b2c6]",
                  )}
                >
                  {d.filmCount.toLocaleString()}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Detail panel — the selected decade controls everything here */}
      <div className="flex flex-col rounded-xl border border-white/10 bg-[#0c0c14] p-6">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#9e9ab0]">
          Selected decade
        </p>
        <div className="mt-1 flex items-center gap-3">
          <p className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none text-[#f4f0f7] sm:text-6xl">
            {current.decade}s
          </p>
          {current.decade === peakDecade && (
            <span className="rounded-full border border-[#e8453c]/40 bg-[#e8453c]/10 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#ff766d]">
              Peak era
            </span>
          )}
        </div>

        <div className="mt-6 flex items-end gap-3">
          <p className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#f4f0f7]">
            {current.filmCount.toLocaleString()}
          </p>
          <p className="pb-1 text-sm text-[#b6b2c6]">films</p>
          <span
            className={cn(
              "mb-0.5 ml-auto rounded-md px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs font-medium tabular-nums",
              vsAvg >= 0 ? "bg-[#e8453c]/12 text-[#ff8a83]" : "bg-white/[0.06] text-[#9e9ab0]",
            )}
          >
            {vsAvg >= 0 ? "+" : ""}
            {vsAvg.toFixed(0)}% vs avg decade
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">
              Avg nominations
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#f4f0f7]">
              {current.avgNominations.toFixed(1)}
            </dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">
              Share of archive
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#f4f0f7]">
              {share.toFixed(1)}%
            </dd>
          </div>
        </dl>

        {current.topFilm && (
          <Link
            href={`/film/${current.topFilm.slug}`}
            className="group mt-5 block rounded-lg border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
          >
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">
              Defining film
            </p>
            <p className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-bold text-[#f4f0f7] transition-colors group-hover:text-white">
              {current.topFilm.title}
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-sm text-[#ff766d]">
              {current.topFilm.count} nominations
            </p>
          </Link>
        )}

        <Link
          href={current.href}
          className="mt-5 inline-flex items-center gap-2 self-start rounded-md border border-white/10 bg-white/[0.045] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#c4c1d2] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d]"
        >
          Browse the {current.decade}s
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
