"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DecadeDatum } from "../types";

type DecadeDetailProps = {
  decade: DecadeDatum;
  peakDecade: number;
  averageFilmCount: number;
  totalFilms: number;
};

export function DecadeDetail({ decade, peakDecade, averageFilmCount, totalFilms }: DecadeDetailProps) {
  const versusAverage = averageFilmCount > 0 ? ((decade.filmCount - averageFilmCount) / averageFilmCount) * 100 : 0;
  const archiveShare = totalFilms > 0 ? (decade.filmCount / totalFilms) * 100 : 0;

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-[#0c0c14] p-6">
      <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#9e9ab0]">Selected decade</p>
      <div className="mt-1 flex items-center gap-3">
        <p className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none text-[#f4f0f7] sm:text-6xl">{decade.decade}s</p>
        {decade.decade === peakDecade && <span className="rounded-full border border-[#e8453c]/40 bg-[#e8453c]/10 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#ff766d]">Peak era</span>}
      </div>
      <div className="mt-6 flex items-end gap-3">
        <p className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#f4f0f7]">{decade.filmCount.toLocaleString()}</p>
        <p className="pb-1 text-sm text-[#b6b2c6]">films</p>
        <span className={cn("mb-0.5 ml-auto rounded-md px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs font-medium tabular-nums", versusAverage >= 0 ? "bg-[#e8453c]/12 text-[#ff8a83]" : "bg-white/[0.06] text-[#9e9ab0]")}>{versusAverage >= 0 ? "+" : ""}{versusAverage.toFixed(0)}% vs avg decade</span>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
        <div><dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">Avg nominations</dt><dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#f4f0f7]">{decade.avgNominations.toFixed(1)}</dd></div>
        <div><dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">Share of archive</dt><dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#f4f0f7]">{archiveShare.toFixed(1)}%</dd></div>
      </dl>
      {decade.topFilm && <Link href={`/film/${decade.topFilm.slug}`} className="group mt-5 block rounded-lg border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.05]"><p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#9e9ab0]">Defining film</p><p className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-bold text-[#f4f0f7] transition-colors group-hover:text-white">{decade.topFilm.title}</p><p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-sm text-[#ff766d]">{decade.topFilm.count} nominations</p></Link>}
      <Link href={decade.href} className="mt-5 inline-flex items-center gap-2 self-start rounded-md border border-white/10 bg-white/[0.045] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.14em] text-[#c4c1d2] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d]">Browse the {decade.decade}s<ArrowUpRight className="h-3.5 w-3.5" /></Link>
    </div>
  );
}
