import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "../format-number";
import type { Accent, FilmStat } from "../types";
import { Panel } from "./panel";

type RankingListProps = { icon: ReactNode; title: string; films: FilmStat[]; unit: string; accent: Accent };

export function RankingList({ icon, title, films, unit, accent }: RankingListProps) {
  const accentClass = accent === "red" ? "text-[#ff766d]" : "text-[#78b7ff]";
  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="mb-2 flex items-center gap-3"><span className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.045]", accentClass)}>{icon}</span><h3 className="text-xl font-semibold tracking-normal text-[#f2eff8]">{title}</h3></div>
      <ol className="mt-4 divide-y divide-white/10">
        {films.slice(0, 6).map((film, index) => <li key={film.id}><Link href={`/film/${film.slug}`} className="group grid min-w-0 grid-cols-[24px_42px_minmax(0,1fr)] items-center gap-3 py-3 transition-colors hover:bg-white/[0.025] sm:grid-cols-[24px_42px_minmax(0,1fr)_auto]"><span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#4b4658]">{index + 1}</span><span className="relative h-14 overflow-hidden rounded bg-[#11111a]">{film.posterUrl && <Image src={film.posterUrl} alt={`${film.title} poster`} fill sizes="42px" className="object-cover" />}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#eeeaf6] transition-colors group-hover:text-white">{film.title}</span><span className="mt-0.5 block font-[family-name:var(--font-geist-mono)] text-xs text-[#9e9ab0]">{film.releaseYear}</span></span><span className={cn("col-start-3 -mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] sm:col-start-auto sm:mt-0 sm:shrink-0 sm:text-right sm:text-xs sm:tracking-[0.14em]", accentClass)}>{formatNumber(film.count)} {unit}</span></Link></li>)}
      </ol>
    </Panel>
  );
}
