import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Accent, FilmStat } from "../types";

type RunnerUpFilmCardProps = { film: FilmStat; rank: number; unit: string; accent: Accent };

export function RunnerUpFilmCard({ film, rank, unit, accent }: RunnerUpFilmCardProps) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";
  return (
    <Link href={`/film/${film.slug}`} className="group flex min-w-0 gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
      <div className="relative h-20 w-[54px] shrink-0 overflow-hidden rounded bg-[#11111a]">
        {film.posterUrl && <Image src={film.posterUrl} alt={`${film.title} poster`} fill sizes="54px" className="object-cover" />}
        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-white/15 bg-black/60 font-[family-name:var(--font-display)] text-xs font-bold text-white">{rank}</span>
      </div>
      <div className="flex min-w-0 flex-col justify-between py-0.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#eeeaf6] transition-colors group-hover:text-white">{film.title}</p>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.12em] text-[#9e9ab0]">{film.releaseYear}<span className="mx-1.5 text-white/15">·</span><span className={cn(accentClass)}>{film.count} {unit}</span></p>
      </div>
    </Link>
  );
}
