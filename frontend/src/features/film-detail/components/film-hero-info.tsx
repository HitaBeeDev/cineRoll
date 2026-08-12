import { HeroCTAs } from "@/components/hero-ctas";
import { buildShareCaption } from "../share-caption";
import { displayTitle } from "@/lib/utils/display-title";
import { SITE_URL } from "@/lib/site-url";
import type { FilmHeroInfoProps } from "../component-props";
import { HeroAccolades } from "./hero-accolades";
import { HeroFilmIdentity } from "./hero-film-identity";

export function FilmHeroInfo({
  film,
  accent,
  awardSummary,
}: FilmHeroInfoProps) {
  const title = displayTitle(film.title);

  return (
    <div className="min-w-0 flex-1">
      {/* 65ch is a reading measure: it exists so the title, credit and metadata
          hold a comfortable line length. It has no business sizing the action
          row, which is not prose — and while it did, the row sat a few pixels
          from wrapping and any change to a control tipped it onto two lines. The
          row is bounded by this column's flex width instead, so it can't collide
          with the award panel beside it. */}
      <div style={{ maxWidth: "65ch" }}>
        <HeroFilmIdentity film={film} accent={accent} />
        <HeroAccolades film={film} summary={awardSummary} />
      </div>
      <div className="mt-10">
        <HeroCTAs
          trailerUrl={film.trailerUrl}
          filmId={film.id}
          filmTitle={title}
          shareUrl={`${SITE_URL}/film/${film.slug}`}
          shareTitle={`Watch ${title} tonight — CineRoll picked it`}
          shareCaption={buildShareCaption(film)}
        />
      </div>
    </div>
  );
}
