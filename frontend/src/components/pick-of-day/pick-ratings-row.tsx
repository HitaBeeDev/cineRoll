import { Star } from "lucide-react";
import type { PickOfDayFilm } from "@/lib/api";
import { filmGenreList } from "@/lib/format/film-genre-list";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatGenre } from "@/lib/format/format-genre";

/** IMDb rating, RT score, the type (when it isn't a plain film), and every genre. */
export function PickRatingsRow({ film }: { film: PickOfDayFilm }) {
  const contentType = formatContentType(film);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {film.imdbRating != null ? (
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
          <Star className="h-4 w-4 fill-amber-400" aria-hidden />
          {film.imdbRating.toFixed(1)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-400/40">
          <Star className="h-4 w-4 fill-amber-400/40" aria-hidden />
          No IMDb
        </span>
      )}
      {film.rtScore != null ? (
        <span className="text-xs font-medium text-zinc-300 tabular-nums">
          🍅 {film.rtScore}%
        </span>
      ) : (
        <span className="text-xs font-medium text-zinc-500/60 tabular-nums">
          🍅 No RT Score
        </span>
      )}
      {/* Rectangular mono tags — the same type-then-genres row the roll card and
          the film-detail hero use, so one title reads the same on every surface. */}
      {contentType && (
        <span className="rounded-[3px] border border-white/25 bg-white/[0.07] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#dcdce6]">
          {contentType}
        </span>
      )}
      {filmGenreList(film).map((g) => (
        <span
          key={g}
          className="rounded-[3px] border border-white/[0.09] bg-white/[0.03] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#8b8b9d]"
        >
          {formatGenre(g)}
        </span>
      ))}
    </div>
  );
}
