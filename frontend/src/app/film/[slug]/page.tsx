import { Suspense, type CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ShareBanner } from "@/components/share-banner";
import { buildFilmMetadata } from "@/features/film-detail/build-film-metadata";
import { FALLBACK_FILM_ACCENT } from "@/features/film-detail/config/fallback-film-accent";
import { computeAwardSummary } from "@/features/film-detail/compute-award-summary";
import { CastSection } from "@/features/film-detail/components/cast-section";
import { FilmAwardsSection } from "@/features/film-detail/components/film-awards-section";
import { FilmDetailsSection } from "@/features/film-detail/components/film-details-section";
import { FilmHero } from "@/features/film-detail/components/film-hero";
import { FilmStructuredData } from "@/features/film-detail/components/film-structured-data";
import { SimilarFilmsSection } from "@/features/film-detail/components/similar-films-section";
import { WhereToStreamSection } from "@/features/film-detail/components/where-to-stream-section";
import { SynopsisSection } from "@/features/film-detail/components/synopsis-section";
import { TrailerSection } from "@/features/film-detail/components/trailer-section";
import { fetchFilm } from "@/features/film-detail/film-repository/fetch-film";
import { fetchSimilarFilms } from "@/features/film-detail/film-repository/fetch-similar-films";
import { fetchFilmLinks } from "@/features/film-detail/film-repository/fetch-film-links";
import { FilmExploreSection } from "@/features/film-detail/components/film-explore-section";
import { fetchPlaces } from "@/features/places/fetch-places";
import { LastUpdated } from "@/components/last-updated";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { getRankTags } from "@/features/film-detail/get-rank-tags";
import { pickHeadlineAccolade } from "@/features/film-detail/pick-headline-accolade";
type FilmPageProps = { params: Promise<{ slug: string }> };

// A week — must be a literal; mirrors FILM_REVALIDATE_SECONDS.
export const revalidate = 604800;

// Rendered on first visit, then served from the cache. Without this (even an
// empty list) Next treats a [slug] route as fully dynamic and ignores
// `revalidate`: every film page was rendered per request, `no-store`, ~0.7 s
// to first byte — the biggest single cost in its LCP.
export function generateStaticParams() {
  return [];
}

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
  const [film, similarFilms, filmLinks, countries, languages] = await Promise.all([
    fetchFilm(slug),
    fetchSimilarFilms(slug),
    fetchFilmLinks(slug),
    // Only countries/languages with a page get a link; a failure just drops them.
    fetchPlaces("countries").catch(() => []),
    fetchPlaces("languages").catch(() => []),
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
      <div className="px-6 pt-5 sm:px-10 lg:px-16">
        <Breadcrumbs
          crumbs={[
            { label: "Browse", href: "/browse" },
            { label: `${film.title} (${formatFilmYear(film)})`, href: `/film/${film.slug}` },
          ]}
        />
      </div>
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
          <WhereToStreamSection
            watchProviders={film.watchProviders}
            tmdbId={film.tmdbId}
            contentType={film.contentType}
          />
          <FilmDetailsSection film={film} rankTags={getRankTags(film)} />
          <FilmAwardsSection summary={awardSummary} filmTitle={film.title} />
          <CastSection cast={film.cast} accent={accent} />
          <SimilarFilmsSection films={similarFilms} />
          <FilmExploreSection film={film} links={filmLinks} countries={countries} languages={languages} />
          <LastUpdated iso={film.updatedAt} />
          <TrailerSection film={film} />
        </div>
      </div>
    </main>
  );
}
