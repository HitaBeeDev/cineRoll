import type { ReactNode } from "react";
import type { AwardRecord, CastMember, Film } from "@cineroll/types";
import type { HeadlineAccolade } from "@/components/hero-headline-accolade";
import type { AwardSummary, HeroImage, SimilarFilm } from "./domain-types";

export type FilmProps = { film: Film };
export type ChildrenProps = { children: ReactNode };
export type AwardSummaryProps = { summary: AwardSummary };
export type SimilarFilmsProps = { films: SimilarFilm[] };
export type AccentProps = { accent: string };
export type FilmAccentProps = FilmProps & AccentProps;
export type SynopsisSectionProps = AccentProps & { plot: string };
export type FilmDetailsSectionProps = FilmProps & { rankTags: string[] };
export type CastSectionProps = AccentProps & { cast: CastMember[] };
export type CastCardProps = AccentProps & { member: CastMember };
export type HeroGenreTagProps = { genre: string };

export type AwardSummaryCardProps = {
  title: string;
  wins: number;
  nominations: number;
  records: AwardRecord[];
  showCounts: boolean;
};

export type FilmHeroBackgroundProps = FilmAccentProps & { image: HeroImage };

export type HeroMetaLineProps = FilmAccentProps & {
  language: string | null;
  runtime: string | null;
};

export type FilmHeroAsideProps = FilmAccentProps & {
  awardSummary: AwardSummary;
  headlineAccolade: HeadlineAccolade | null;
};

export type FilmHeroInfoProps = FilmAccentProps & {
  awardSummary: AwardSummary;
};

export type HeroAccoladesProps = FilmProps & { summary: AwardSummary };
export type FilmHeroProps = FilmHeroAsideProps;
