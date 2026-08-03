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
 * The meta block under a poster tile, built like the roll card's: a bordered
 * type chip leading the facts strip (year · length), then every genre as plain
 * text on its own line.
 *
 * The type is a category and gets a box; the genres are prose and do not — a
 * bordered box that ignores clicks reads as a broken button. Only the surprising
 * kinds are labelled, so a plain feature film shows no chip at all.
 *
 * Shared by the browse grid, watchlist, history and list cards so the four
 * cannot drift apart.
 */
export function TileMetaLine({ film }: { film: TileMetaFilm }) {
  // Year and length are the two numbers a viewer decides on; length is a runtime
  // for a film and a season count for a series.
  const facts = [formatFilmYear(film) || "—", formatFilmLength(film)].filter(Boolean).join(" · ");
  const contentType = formatContentType(film);
  const genres = formatGenres(film);

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      {/* Pinned to the chip's own height (14px line + 4px padding + 2px border)
          and both children share that line box, so a movie's bare facts line and
          a series' chipped one occupy identical vertical space. Without it the
          chip grows its row and pushes the genre line of every tile in the grid
          row a few pixels down. */}
      <div className="flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1">
        {contentType && (
          <span className="rounded-[3px] border border-white/25 bg-white/[0.07] px-1.5 py-[2px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-[14px] tracking-[0.16em] text-[#dcdce6]">
            {contentType}
          </span>
        )}
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] leading-[14px] text-[#8d879d]">
          {facts}
        </p>
      </div>

      {/* Brighter than the facts above: genres are what the title IS about and
          carry more weight in a browse decision than its running time.
          Clamped, not truncated mid-list — a tile is a fifth of a row wide and a
          six-genre title would otherwise push the grid rows out of line. */}
      {genres && (
        <p className="line-clamp-2 font-[family-name:var(--font-geist-mono)] text-[11px] leading-[15px] text-[#b6b0c6]">
          {genres}
        </p>
      )}
    </div>
  );
}
