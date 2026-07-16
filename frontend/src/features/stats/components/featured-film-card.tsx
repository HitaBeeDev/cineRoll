import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Accent, FilmStat } from "../types";

type FeaturedFilmCardProps = { film: FilmStat; rank: number; unit: string; accent: Accent };

export function FeaturedFilmCard({ film, rank, unit, accent }: FeaturedFilmCardProps) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";
  const glow = accent === "red" ? "rgba(232,69,60,0.22)" : "rgba(74,158,255,0.20)";
  return (
    <Link href={`/film/${film.slug}`} className="group relative grid overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] shadow-[0_28px_80px_rgba(0,0,0,0.4)] transition-colors hover:border-white/30 sm:grid-cols-[210px_minmax(0,1fr)]">
      <div className="relative min-h-72 bg-[#11111a] sm:min-h-full">
        {film.posterUrl ? <Image src={film.posterUrl} alt={`${film.title} poster`} fill sizes="(max-width: 640px) 100vw, 210px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,#151520,#0b0b12)]" />}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,8,13,0.7)_100%)]" />
        <span className="absolute left-3 top-3 flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-black/55 px-2.5 font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">№ {rank}</span>
      </div>
      <div className="relative flex min-w-0 flex-col justify-between p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 100% 100%, ${glow}, transparent 62%)` }} />
        <div className="relative flex items-start justify-between gap-3"><span className={cn("font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em]", accentClass)}>Record holder</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#c4c1d2] transition-colors group-hover:bg-white/[0.1] group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span></div>
        <h4 className="relative mt-5 line-clamp-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.02] text-[#f4f0f7] sm:text-4xl">{film.title}</h4>
        <div className="relative mt-6 flex items-end justify-between gap-4"><p className="pb-2 font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-[0.16em] text-[#b6b2c6]">{film.releaseYear}</p><p className="text-right leading-[0.8]"><span className={cn("font-[family-name:var(--font-display)] text-6xl font-bold sm:text-7xl", accentClass)}>{film.count}</span><span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#b6b2c6]">{unit}</span></p></div>
      </div>
    </Link>
  );
}
