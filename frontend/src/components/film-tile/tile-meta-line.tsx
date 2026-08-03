import { formatContentType, formatFilmLength, formatFilmYear, formatGenres } from "@/lib/format";

type TileMetaFilm = {
  year?: number | null;
  releaseYear?: number | null;
  runtime?: number | null;
  genres?: string[] | null;
  contentType?: string | null;
  types?: string[] | null;
  tvStartYear?: number | null;
  tvEndYear?: number | null;
  tvSeasons?: number | null;
};

/**
 * The line under a poster tile: year · type · length · every genre.
 *
 * The length is a runtime for a film and a season count for a series, so it
 * sits after the type that explains which one it is — "1990–1991 · TV Series ·
 * 3 seasons" rather than a bare "3 seasons" next to a year range.
 *
 * Shared by the browse grid, watchlist, history and list cards so the four
 * cannot drift apart. Two lines, not one: a complete genre list rarely fits a
 * tile's width, and truncating it would defeat the point of showing it.
 */
export function TileMetaLine({ film }: { film: TileMetaFilm }) {
  const parts = [
    formatFilmYear(film) || "—",
    formatContentType(film),
    formatFilmLength(film),
    formatGenres(film),
  ].filter(Boolean);

  return (
    <p className="mt-1 line-clamp-2 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#9d98ad]">
      {parts[0]}
      {parts.length > 1 && <span className="text-[#8d879d]"> · {parts.slice(1).join(" · ")}</span>}
    </p>
  );
}
