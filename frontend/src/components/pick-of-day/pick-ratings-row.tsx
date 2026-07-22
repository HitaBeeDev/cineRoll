import { Star } from "lucide-react";
import type { PickOfDayFilm } from "@/lib/api";

/** IMDb rating, RT score, and the first few genre chips. */
export function PickRatingsRow({ film }: { film: PickOfDayFilm }) {
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
      {film.genres.slice(0, 3).map((g) => (
        <span
          key={g}
          className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300"
        >
          {g}
        </span>
      ))}
    </div>
  );
}
