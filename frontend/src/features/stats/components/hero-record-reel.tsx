"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReelItem } from "../types";
import { SmartLink } from "./smart-link";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const ACCENT_TEXT: Record<ReelItem["accent"], string> = {
  red: "text-[#ff766d]",
  blue: "text-[#78b7ff]",
  gold: "text-[#f2d86f]",
};

type HeroRecordReelProps = { items: ReelItem[]; intervalMs?: number };

export function HeroRecordReel({ items, intervalMs = 4200 }: HeroRecordReelProps) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused || items.length <= 1) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), intervalMs);
    return () => clearInterval(timer);
  }, [reduced, paused, items.length, intervalMs]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-xl border border-[#e8453c]/25 bg-[#100b10] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:p-7"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
    >
      <style>{`@keyframes reelEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 80% 0%, rgba(232,69,60,0.18), transparent 60%)" }} />
      <SmartLink href={item.href} className="relative flex items-start justify-between gap-4" ariaLabel={`${item.eyebrow}: ${item.title}`}>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#ff766d]">{item.eyebrow}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-[#ff766d] transition-colors group-hover:bg-[#e8453c] group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
      </SmartLink>
      <div key={index} className="relative mt-4" style={reduced ? undefined : { animation: "reelEnter 600ms ease-out" }}>
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.05] text-[#f4f0f7] sm:text-4xl">{item.title}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className={cn("font-[family-name:var(--font-display)] text-5xl font-bold leading-none sm:text-6xl", ACCENT_TEXT[item.accent])}>{item.value}</p>
          <p className="pb-1 text-right font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#b6b2c6]">{item.sub}</p>
        </div>
      </div>
      <div className="relative mt-6 flex items-center gap-2" role="tablist" aria-label="Featured records">
        {items.map((entry, itemIndex) => (
          <button key={entry.eyebrow} type="button" role="tab" aria-selected={itemIndex === index} aria-label={entry.eyebrow} onClick={() => setIndex(itemIndex)} className={cn("h-1.5 rounded-full transition-all", itemIndex === index ? "w-7 bg-[#e8453c]" : "w-2.5 bg-white/20 hover:bg-white/40")} />
        ))}
      </div>
    </div>
  );
}
