import { HeroHeadlineAccolade } from "@/components/hero-headline-accolade";
import { PosterCard } from "@/components/poster-card";
import type { FilmHeroAsideProps } from "../component-props";

export function FilmHeroAside(props: FilmHeroAsideProps) {
  if (props.film.backdropUrl) {
    if (props.awardSummary.totalNominations === 0) return null;
    return (
      <HeroHeadlineAccolade
        headline={props.headlineAccolade}
        totalWins={props.awardSummary.totalWins}
        totalNominations={props.awardSummary.totalNominations}
      />
    );
  }

  if (!props.film.posterUrl) return null;
  return (
    <PosterCard
      posterUrl={props.film.posterUrl}
      title={props.film.title}
      accent={props.accent}
    />
  );
}
