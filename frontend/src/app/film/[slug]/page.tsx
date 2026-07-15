import { Suspense, type CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ShareBanner } from "@/components/share-banner";
import { WhereToWatch } from "@/components/where-to-watch";
import { buildFilmMetadata } from "@/features/film-detail/build-film-metadata";
import { FALLBACK_FILM_ACCENT } from "@/features/film-detail/config";
import { computeAwardSummary } from "@/features/film-detail/compute-award-summary";
import { CastSection } from "@/features/film-detail/components/cast-section";
import { FilmAwardsSection } from "@/features/film-detail/components/film-awards-section";
import { FilmDetailsSection } from "@/features/film-detail/components/film-details-section";
import { FilmHero } from "@/features/film-detail/components/film-hero";
import { FilmStructuredData } from "@/features/film-detail/components/film-structured-data";
import { SimilarFilmsSection } from "@/features/film-detail/components/similar-films-section";
import { SynopsisSection } from "@/features/film-detail/components/synopsis-section";
import { TrailerSection } from "@/features/film-detail/components/trailer-section";
import {
  fetchFilm,
  fetchSimilarFilms,
} from "@/features/film-detail/film-repository";
import { getRankTags } from "@/features/film-detail/get-rank-tags";
import { pickHeadlineAccolade } from "@/features/film-detail/pick-headline-accolade";
import type { FilmPageProps } from "@/features/film-detail/film-page-props";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = await fetchFilm(slug);
  return film
    ? buildFilmMetadata(film, slug)
    : { title: "Film Not Found" };
}

export default async function FilmPage({ params }: FilmPageProps) {
  const { slug } = await params;
  const [film, similarFilms] = await Promise.all([
    fetchFilm(slug),
    fetchSimilarFilms(slug),
  ]);
  if (!film) notFound();

  const awardSummary = computeAwardSummary(film);
  const accent = film.posterColor ?? FALLBACK_FILM_ACCENT;
  const accentStyle = { "--film-accent": accent } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#07070b] text-[#f4f4f5]"
      style={accentStyle}
    >
      <FilmStructuredData film={film} />
      <Suspense fallback={null}>
        <ShareBanner />
      </Suspense>
      <AppHeader />
      <FilmHero
        film={film}
        accent={accent}
        awardSummary={awardSummary}
        headlineAccolade={pickHeadlineAccolade(awardSummary.ceremonies)}
      />

      <div className="relative overflow-hidden bg-[#0a0a10]">
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(to right, transparent, ${accent}50, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[90vw] max-w-6xl -translate-x-1/2 blur-3xl"
          style={{
            background: `radial-gradient(ellipse, ${accent}18, transparent 68%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl space-y-20 px-6 py-20 lg:px-10">
          {film.plot && <SynopsisSection plot={film.plot} accent={accent} />}
          <FilmDetailsSection film={film} rankTags={getRankTags(film)} />
          <FilmAwardsSection summary={awardSummary} />
          <CastSection cast={film.cast} accent={accent} />
          <SimilarFilmsSection films={similarFilms} />
          <TrailerSection film={film} />
          <WhereToWatch
            watchProviders={film.watchProviders ?? null}
            accent={accent}
          />
        </div>
      </div>
    </main>
  );
}
