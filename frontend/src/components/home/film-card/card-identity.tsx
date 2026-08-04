import { formatContentType } from "@/lib/format/format-content-type";
import { formatCreditLabel } from "@/lib/format/format-credit-label";
import { formatFilmLength } from "@/lib/format/format-film-length";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { formatGenres } from "@/lib/format/format-genres";
import { RecognitionSummary } from "@/components/home/film-card/recognition-summary";
import type { AwardHighlight } from "@/components/home/film-card/awards/award-highlight";
import type { RollFilm } from "@/lib/api";

/**
 * The identity column beside the poster: facts strip → genres → title → credit →
 * recognition. Recognition still leads — it's why the film is in CineRoll — but
 * as one line of summary, with the categories and years it stands on kept for
 * "Recognized for" further down. Stating both at full size made the first screen
 * of the card mostly award furniture.
 */
export function CardIdentity({
  film,
  awardHighlights,
}: {
  film: RollFilm;
  awardHighlights: AwardHighlight[];
}) {
  const meta = [formatFilmYear(film), formatFilmLength(film)].filter(Boolean).join(" · ");
  // What the title IS — only the surprising kinds (series, short, documentary,
  // animation) get a label; a plain feature film returns "".
  const contentType = formatContentType(film);
  const genres = formatGenres(film);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {/* The facts a viewer decides on — year, length, and what kind of thing
          this is — read as one group above the title. The type keeps a border
          because it names a category; the genres below are plain text, since a
          bordered box that does nothing on click reads as a broken button. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {contentType && (
            <span className="rounded-[3px] border border-white/25 bg-white/[0.07] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#e6e6ee]">
              {contentType}
            </span>
          )}
          <p className="font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.2em] text-[#b6b6c4]">
            {meta}
          </p>
        </div>

        {genres && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.14em] text-[#b6b6c4]">
            {genres}
          </p>
        )}
      </div>

      {/* Title — the payoff of the roll, at display scale so it reads as the
          loudest element in the result column. */}
      <h2
        className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-[#F5F5F0]"
        style={{ fontSize: "clamp(1.85rem, 2.8vw, 2.85rem)" }}
      >
        {film.title}
      </h2>

      {/* A person's name is content, not a label: it gets the larger size and
          tighter tracking, while the credit word beside it keeps the wide
          label spacing of the strip above. */}
      {film.director && (
        <p className="font-[family-name:var(--font-geist-mono)] text-[13px] uppercase tracking-[0.08em] text-[#d6d6e2]">
          <span className="tracking-[0.2em] text-[#a4a4b4]">{formatCreditLabel(film)}</span>{" "}
          {film.director}
        </p>
      )}

      {awardHighlights.length > 0 && <RecognitionSummary highlights={awardHighlights} />}
    </div>
  );
}
