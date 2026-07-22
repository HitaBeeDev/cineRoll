import type { RollFilm } from "@/lib/api";
import { StatBox } from "@/components/home/film-card/stat-box";

/** Supporting evidence beneath the award headline: the IMDb and RT scores. */
export function FilmScores({ film }: { film: RollFilm }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <StatBox label="IMDb" value={film.imdbRating != null ? film.imdbRating.toFixed(1) : "—"} />
      <StatBox label="RT" value={film.rtScore != null ? `${film.rtScore}%` : "—"} />
    </div>
  );
}
