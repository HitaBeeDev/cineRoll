import { filmGenreList, formatContentType, formatFilmLength, formatFilmYear, formatGenre } from "@/lib/format";
import { AwardsPanel } from "@/components/home/film-card/awards-panel";
import type { AwardHighlight } from "@/components/home/film-card/awards";
import type { RollFilm } from "@/lib/api";

/**
 * The identity column beside the poster: meta line → title → director →
 * Recognition. The award record leads as the headline credential — it's why the
 * film is in CineRoll — above the plot and ratings that merely support it.
 */
export function CardIdentity({
  film,
  awardHighlights,
}: {
  film: RollFilm;
  awardHighlights: AwardHighlight[];
}) {
  // The facts strip holds only the two numbers — year and length. What the title
  // IS (type, then genres) is a row of tags below: at this letter-spacing a run
  // of words in the strip wraps and orphans the runtime on a second line.
  const meta = [formatFilmYear(film), formatFilmLength(film)].filter(Boolean).join(" · ");
  const contentType = formatContentType(film);
  const genres = filmGenreList(film);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
        {meta}
      </p>

      {/* Title — the payoff of the roll, at display scale so it reads as the
          loudest element in the result column. */}
      <h2
        className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-[#F5F5F0]"
        style={{ fontSize: "clamp(1.85rem, 2.8vw, 2.85rem)" }}
      >
        {film.title}
      </h2>

      {film.director && (
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
          Dir. {film.director}
        </p>
      )}

      {(contentType || genres.length > 0) && (
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {/* The type leads the row and carries a brighter border than the
              genres beside it — it says what the title is, they say what it's
              about. */}
          {contentType && (
            <span className="rounded-[3px] border border-white/25 bg-white/[0.07] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#dcdce6]">
              {contentType}
            </span>
          )}
          {genres.map((genre) => (
            <span
              key={genre}
              className="rounded-[3px] border border-white/[0.09] bg-white/[0.03] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#8b8b9d]"
            >
              {formatGenre(genre)}
            </span>
          ))}
        </div>
      )}

      {awardHighlights.length > 0 && <AwardsPanel highlights={awardHighlights} />}
    </div>
  );
}
