import type { RollFilm } from "@/lib/api";
import { StatBox } from "@/components/home/film-card/stat-box";

/**
 * The IMDb and RT scores.
 *
 * Two shapes for two containers. `box` is the pair of framed stats: it fills a
 * row in the page rail's narrow column, and it closes the right edge of the roll
 * panel's header band, where the title and the ratings read as one masthead.
 * `strip` is the same two numbers as a line of text, for the narrow widths of
 * that panel where the band has no right edge to spare.
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
    <div className="grid grid-cols-2 gap-2">
      <StatBox label="IMDb" value={imdb} />
      <StatBox label="RT" value={rt} />
    </div>
  );
}
