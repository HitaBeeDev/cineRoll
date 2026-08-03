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
  // The facts strip stays three short tokens — year · type · length. Genres are
  // deliberately NOT in here: at this letter-spacing a full genre run wraps and
  // orphans the runtime on a second line. They get their own tag row below,
  // the same way the film-detail hero handles them.
  const meta = [formatFilmYear(film), formatContentType(film), formatFilmLength(film)]
    .filter(Boolean)
    .join(" · ");
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

      {genres.length > 0 && (
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
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
