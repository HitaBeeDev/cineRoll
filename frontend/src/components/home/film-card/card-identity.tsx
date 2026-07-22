import { formatFilmLength } from "@/lib/format";
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
  const runtime = formatFilmLength(film);
  const genre = film.genres[0] ?? "";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
        {film.year}
        {runtime && ` · ${runtime}`}
        {genre && ` · ${genre}`}
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

      {awardHighlights.length > 0 && <AwardsPanel highlights={awardHighlights} />}
    </div>
  );
}
