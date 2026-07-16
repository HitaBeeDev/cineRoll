"use client";

import { cn } from "@/lib/utils";
import type { DecadeDatum } from "../types";

type DecadeBarsProps = {
  decades: DecadeDatum[];
  activeDecade: number;
  peakDecade: number;
  maximumFilmCount: number;
  onSelect: (decade: number) => void;
};

export function DecadeBars({ decades, activeDecade, peakDecade, maximumFilmCount, onSelect }: DecadeBarsProps) {
  return (
    <ul className="flex flex-col justify-center gap-3">
      {decades.map((item) => {
        const active = item.decade === activeDecade;
        const peak = item.decade === peakDecade;
        return (
          <li key={item.decade}>
            <button type="button" aria-pressed={active} onMouseEnter={() => onSelect(item.decade)} onFocus={() => onSelect(item.decade)} onClick={() => onSelect(item.decade)} className="grid w-full grid-cols-[64px_minmax(0,1fr)_72px] items-center gap-4 rounded-md px-1 py-1 text-left outline-none focus-visible:bg-white/[0.04]">
              <span className={cn("font-[family-name:var(--font-display)] font-bold transition-all", active ? "text-xl text-[#f4f0f7]" : "text-base text-[#a9a5bc]")}>{item.decade}s</span>
              <span className="relative h-4 overflow-hidden rounded-full bg-white/[0.06]">
                <span className="block h-full rounded-full transition-[width,background-color] duration-300" style={{ width: `${Math.max(4, (item.filmCount / maximumFilmCount) * 100)}%`, backgroundColor: active ? "#ff625a" : peak ? "#e8453c" : "#7e302d" }} />
              </span>
              <span className={cn("text-right font-[family-name:var(--font-geist-mono)] text-sm tabular-nums transition-colors", active ? "text-[#f4f0f7]" : "text-[#b6b2c6]")}>{item.filmCount.toLocaleString()}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
