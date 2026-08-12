import type { RollFilm } from "@/lib/api";
import { StatBox } from "@/components/home/film-card/stat-box";

/**
 * The IMDb and RT scores.
 *
 * Two shapes for two containers. `box` is the page rail's, where the card is a
 * narrow column and a pair of boxes fills a row that would otherwise be empty.
 * `strip` is for the wide panel, where those same two boxes were ~90px of card
 * carrying four characters of information — here they are one line under the
 * header, next to the film they describe.
 */
export function FilmScores({
  film,
  variant = "box",
}: {
  film: RollFilm;
  variant?: "box" | "strip";
}) {
  const imdb = film.imdbRating != null ? film.imdbRating.toFixed(1) : "—";
  const rt = film.rtScore != null ? `${film.rtScore}%` : "—";

  if (variant === "strip") {
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[12px] text-fg-muted">
        <span>
          <span className="text-fg-faint">IMDb</span>{" "}
          <span className="font-bold text-fg-hi">{imdb}</span>
        </span>
        <span aria-hidden className="text-edge-hover">
          ·
        </span>
        <span>
          <span className="text-fg-faint">RT</span>{" "}
          <span className="font-bold text-fg-hi">{rt}</span>
        </span>
      </p>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <StatBox label="IMDb" value={imdb} />
      <StatBox label="RT" value={rt} />
    </div>
  );
}
