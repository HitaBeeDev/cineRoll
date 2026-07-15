import { HeroCTAs } from "@/components/hero-ctas";
import { buildShareCaption } from "../share-caption";
import { displayTitle } from "../display-title";
import { SITE_URL } from "../config";
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
    <div className="min-w-0 flex-1" style={{ maxWidth: "65ch" }}>
      <HeroFilmIdentity film={film} accent={accent} />
      <HeroAccolades film={film} summary={awardSummary} />
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
