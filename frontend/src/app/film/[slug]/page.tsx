import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import type { Film, AwardRecord, CastMember } from "@cineroll/types";
import { cn, nameToSlug } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { FilmTrailer } from "@/components/film-trailer";
import { WhereToWatch } from "@/components/where-to-watch";
import { SimilarFilmsSlider } from "@/components/similar-films-slider";
import { ShareBanner } from "@/components/share-banner";
import { HeroRatings } from "@/components/hero-ratings";
import { HeroAwards } from "@/components/hero-awards";
import { HeroCTAs } from "@/components/hero-ctas";
import { PosterCard } from "@/components/poster-card";
import { FilmRatingPanel } from "@/components/film-rating-panel";
import { FilmCommentsSection } from "@/components/film-comments-section";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");
const FALLBACK_ACCENT = "#D4AF37";
// Prestige gold for the hero accolades module — fixed regardless of the film's
// own poster accent, so awards always read as the universal "honour" cue.
const HERO_GOLD = "#D4AF37";

function displayTitle(title: string): string {
  return title.replace(/^(.*),\s+(The|A|An)$/i, "$2 $1");
}

function buildShareCaption(film: Film): string {
  const parts: string[] = [];
  if (film.oscarWins > 0)
    parts.push(`${film.oscarWins} Oscar ${film.oscarWins === 1 ? "win" : "wins"}`);
  if (film.ggNominations > 0)
    parts.push(`${film.ggNominations} Golden Globe ${film.ggNominations === 1 ? "nomination" : "nominations"}`);
  if (film.cannesWins > 0)
    parts.push(`${film.cannesWins} Cannes ${film.cannesWins === 1 ? "win" : "wins"}`);
  const awardPart = parts.length > 0 ? ` — ${parts.join(", ")}` : "";
  return `Watching ${displayTitle(film.title)} tonight${awardPart} 🎬 via CineRoll`;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {
    /* invalid URL */
  }
  return null;
}

async function fetchFilm(slug: string): Promise<Film | null> {
  const res = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch film: ${res.status}`);
  return (await res.json()) as Film;
}

type SimilarFilm = {
  id: string;
  slug: string;
  title: string;
  year: number;
  releaseYear: number;
  genres: string[];
  contentType: string;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  oscarWins: number;
  oscarNominations: number;
  ggWins: number;
  ggNominations: number;
  cannesWins: number;
  cannesNominations: number;
};

async function fetchSimilarFilms(slug: string): Promise<SimilarFilm[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/films/${encodeURIComponent(slug)}/similar`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    return (await res.json()) as SimilarFilm[];
  } catch {
    return [];
  }
}

type CeremonySummary = {
  title: string;
  code: string;
  shortLabel: string;
  icon: "oscar" | "globe" | "cannes";
  wins: number;
  nominations: number;
  records: AwardRecord[];
};

type AwardSummary = {
  totalWins: number;
  totalNominations: number;
  ceremonies: CeremonySummary[];
};

/**
 * Single source of truth for a film's award numbers. Every wins/nominations
 * figure on the page — the headline counter, the per-ceremony cards, and the
 * SEO summary — derives from this, so the totals can never drift apart.
 */
function computeAwardSummary(film: Film): AwardSummary {
  const ceremonies: CeremonySummary[] = [
    {
      title: "Academy Awards",
      code: "AMPAS",
      shortLabel: "Oscar",
      icon: "oscar" as const,
      wins: film.oscarWins,
      nominations: film.oscarNominations,
      records: (film.oscarCategories as AwardRecord[]) ?? [],
    },
    {
      title: "Golden Globes",
      code: "HFPA",
      shortLabel: "Golden Globe",
      icon: "globe" as const,
      wins: film.ggWins,
      nominations: film.ggNominations,
      records: (film.ggCategories as AwardRecord[]) ?? [],
    },
    {
      title: "Cannes Film Festival",
      code: "Cannes",
      shortLabel: "Cannes",
      icon: "cannes" as const,
      wins: film.cannesWins,
      nominations: film.cannesNominations,
      records: (film.cannesCategories as AwardRecord[]) ?? [],
    },
  ].filter((c) => c.nominations > 0);

  return {
    totalWins: ceremonies.reduce((sum, c) => sum + c.wins, 0),
    totalNominations: ceremonies.reduce((sum, c) => sum + c.nominations, 0),
    ceremonies,
  };
}

function getAwardSummary(film: Film): string {
  const { totalWins, totalNominations, ceremonies } = computeAwardSummary(film);
  if (totalWins > 0)
    return `${totalWins} wins across ${totalNominations} major nominations.`;
  const parts = ceremonies.map((c) => `${c.nominations} ${c.shortLabel}`);
  if (parts.length > 0) return `${parts.join(", ")} nominations.`;
  return "Explore its CineRoll film profile.";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await fetchFilm(slug);
  if (!film) return { title: "Film Not Found" };
  const title = `${film.title} (${film.year})`;
  const awardSummary = getAwardSummary(film);
  const rawDescription = film.plot
    ? `${film.plot} ${awardSummary}`
    : `${film.title}${film.director ? `, directed by ${film.director}` : ""}. ${awardSummary}`;
  const description =
    rawDescription.length > 155
      ? `${rawDescription.slice(0, 152)}…`
      : rawDescription;
  const socialImage = new URL(`/api/og/film/${encodeURIComponent(slug)}`, SITE_URL).toString();
  const pageUrl = new URL(`/film/${slug}`, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      type: "video.movie",
      url: pageUrl,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${film.title} (${film.year})` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${film.title} (${film.year})` }],
    },
  };
}

export default async function FilmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams]);
  const [film, similarFilms] = await Promise.all([
    fetchFilm(slug),
    fetchSimilarFilms(slug),
  ]);
  if (!film) notFound();

  const youtubeId = film.trailerUrl ? extractYouTubeId(film.trailerUrl) : null;
  const awardSummary = computeAwardSummary(film);
  const hasAwards = awardSummary.totalNominations > 0;
  const hasRatings = film.imdbRating != null || film.rtScore != null;
  const accent = film.posterColor ?? FALLBACK_ACCENT;
  const formattedRuntime = formatRuntime(film.runtime);

  // IMDb Top-250 / Top-TV ranking signals, surfaced in the meta sidebar below
  // the fold; award win/nom counts live in the Awards section (single source:
  // computeAwardSummary).
  const rankTags = [
    film.imdbTopMovieRank !== null
      ? `IMDb Top 250 #${film.imdbTopMovieRank}`
      : null,
    film.imdbTopTvRank !== null ? `IMDb Top TV #${film.imdbTopTvRank}` : null,
  ].filter(Boolean) as string[];

  const accentStyle = { "--film-accent": accent } as CSSProperties;

  const heroImageUrl = film.backdropUrl ?? film.posterUrl;
  // With no real backdrop we fall back to the poster for the full-bleed image.
  // Blur it hard so it reads as an ambient wash rather than a duplicate of the
  // crisp poster card on the right.
  const heroImageIsPoster = !film.backdropUrl && film.posterUrl != null;

  // Scrim strategy is source-aware. A real backdrop is the film's most
  // emotional asset, so we keep the dark concentrated over the left (text
  // zone) and let the scene emerge through the center-right instead of
  // burying it — this turns the old dead gulf between the copy and the poster
  // into the cinematic focal point. A poster used as a fallback backdrop is
  // just a blurred duplicate of the poster card, so we darken it harder to
  // keep it ambient rather than competing.
  const heroScrim = heroImageIsPoster
    ? `linear-gradient(105deg, rgba(7,7,11,0.97) 0%, rgba(7,7,11,0.92) 35%, rgba(7,7,11,0.72) 60%, rgba(7,7,11,0.45) 100%),
       radial-gradient(ellipse 70% 80% at 22% 50%, rgba(7,7,11,0.55), transparent 62%)`
    : `linear-gradient(100deg, rgba(7,7,11,0.94) 0%, rgba(7,7,11,0.80) 26%, rgba(7,7,11,0.38) 52%, rgba(7,7,11,0.02) 80%),
       radial-gradient(ellipse 55% 75% at 16% 50%, rgba(7,7,11,0.42), transparent 60%)`;

  return (
    <main
      className="min-h-screen bg-[#07070b] text-[#f4f4f5]"
      style={accentStyle}
    >
      {from === "share" && <ShareBanner />}
      <AppHeader />

      {/* ── CINEMATIC HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#07070b]">
        {/* Full-bleed backdrop */}
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={cn(
              "object-cover object-center",
              heroImageIsPoster
                ? "scale-110 opacity-50 blur-2xl saturate-[0.9]"
                : "opacity-[0.82] saturate-[1.15]",
            )}
          />
        )}

        {/* Layered gradient overlays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              ${heroScrim},
              linear-gradient(to top, rgba(7,7,11,0.99) 0%, rgba(7,7,11,0.58) 14%, rgba(7,7,11,0.0) 42%),
              radial-gradient(ellipse 60% 70% at 76% 20%, ${accent}38, transparent 65%),
              radial-gradient(ellipse 35% 25% at 15% 95%, ${accent}12, transparent 70%)
            `,
          }}
        />

        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />

        {/* Hero content vertically centered to fill the height */}
        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center">
          <div className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
            <div className="flex items-center justify-between gap-8 lg:gap-16">

              {/* ── Left: film info ────────────────────────────────── */}
              <div className="min-w-0 flex-1" style={{ maxWidth: "65ch" }}>

                {/* Pick of day */}
                {film.isPickOfDay && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8453c]/40 bg-[#e8453c]/14 px-3.5 py-2 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-[#e8453c]" aria-hidden />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
                      Pick of the Day
                    </span>
                  </div>
                )}

                {/* ── ZONE 1 · IDENTITY ─────────────────────────────
                    What the film is: title, who made it, and the factual
                    metadata line. Tight internal spacing so it reads as one
                    block. */}
                <h1
                  className="font-[family-name:var(--font-display)] font-bold leading-[0.87] tracking-tight text-[#F8F8F4]"
                  style={{ fontSize: "clamp(3rem,7.5vw,7.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
                >
                  {displayTitle(film.title)}
                </h1>

                {/* Director */}
                {film.director && (
                  <Link
                    href={`/person/${nameToSlug(film.director)}`}
                    className="mt-5 inline-block font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.36em] text-white/60 transition-colors hover:text-white/90"
                  >
                    {film.director}
                  </Link>
                )}

                {/* Original title */}
                {film.originalTitle && film.originalTitle !== film.title && (
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl italic text-white/55">
                    {film.originalTitle}
                  </p>
                )}

                {/* Specs: factual metadata as a lightweight dotted text line */}
                <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.18em] text-white/60">
                  <span>{film.year}</span>
                  {formattedRuntime && (
                    <>
                      <MetaDot />
                      <span>{formattedRuntime}</span>
                    </>
                  )}
                  {film.language && (
                    <>
                      <MetaDot />
                      <span>{film.language}</span>
                    </>
                  )}
                  {film.certificate && (
                    <span
                      className="ml-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-[0.16em]"
                      style={{ color: accent, borderColor: `${accent}66` }}
                    >
                      {film.certificate}
                    </span>
                  )}
                </div>

                {/* Tags: genres as chips — the only pills, so they read as tags */}
                {film.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {film.genres.slice(0, 3).map((g) => (
                      <HeroPill key={g}>{g}</HeroPill>
                    ))}
                  </div>
                )}

                {/* ── ZONE 2 · ACCOLADES ────────────────────────────
                    CineRoll's differentiator, framed as one confident module:
                    an eyebrow label, the gold award band, then the supporting
                    critic scores under a hairline. This reads as the headline
                    value of the page — the reason someone is here — rather than
                    as stray badges. Award data leads; third-party scores
                    support. The large zone gap separates it from the identity
                    block above. */}
                {(hasAwards || hasRatings) && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-px w-7"
                        style={{
                          background: `linear-gradient(to right, ${HERO_GOLD}, transparent)`,
                        }}
                      />
                      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.42em] text-white/50">
                        {hasAwards ? "Accolades" : "Critic Scores"}
                      </span>
                    </div>

                    <div className="mt-7 space-y-7">
                      {hasAwards && (
                        <HeroAwards ceremonies={awardSummary.ceremonies} />
                      )}
                      {hasAwards && hasRatings && (
                        <div className="h-px w-full max-w-md bg-gradient-to-r from-white/14 via-white/[0.06] to-transparent" />
                      )}
                      <HeroRatings
                        imdbRating={film.imdbRating}
                        rtScore={film.rtScore}
                      />
                    </div>
                  </div>
                )}

                {/* ── ZONE 3 · ACTIONS ──────────────────────────────
                    What you can do with it. */}
                <div className="mt-10">
                  <HeroCTAs
                    trailerUrl={film.trailerUrl}
                    filmId={film.id}
                    filmTitle={displayTitle(film.title)}
                    shareUrl={`${SITE_URL}/film/${film.slug}`}
                    shareTitle={`Watch ${displayTitle(film.title)} tonight — CineRoll picked it`}
                    shareCaption={buildShareCaption(film)}
                  />
                </div>
              </div>

              {/* ── Right: poster card ───────────────────────────────
                  Only shown when there's NO real backdrop. With a backdrop the
                  full-bleed still IS the hero, so a separate poster card just
                  duplicates the title and sits on the scene as a hard-edged
                  modal. Poster-as-fallback films keep the crisp card, since the
                  background is only a blurred wash of that same poster. */}
              {film.posterUrl && !film.backdropUrl && (
                <PosterCard
                  posterUrl={film.posterUrl}
                  title={film.title}
                  accent={accent}
                />
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.4em] text-white/50">
            Scroll
          </span>
          <ChevronDown
            className="h-4 w-4 animate-bounce text-white/70 [animation-duration:2s]"
            aria-hidden
          />
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0a0a10]">
        {/* Thin accent separator */}
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${accent}50, transparent)` }}
        />
        {/* Ambient glow at top of content */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[90vw] max-w-5xl -translate-x-1/2 blur-3xl"
          style={{
            background: `radial-gradient(ellipse, ${accent}18, transparent 68%)`,
          }}
        />

        <div className="relative mx-auto max-w-5xl space-y-20 px-6 py-20 lg:px-10">

          {/* ── SYNOPSIS ─────────────────────────────────────────────── */}
          {film.plot && (
            <section id="overview">
              <SectionLabel>Synopsis</SectionLabel>
              <div className="relative mt-8 pl-6">
                <div
                  className="absolute bottom-0 left-0 top-0 w-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${accent}aa, ${accent}18, transparent)`,
                  }}
                />
                <p className="text-[1rem] leading-[1.95] tracking-wide text-[#c0c0d8]">
                  {film.plot}
                </p>
              </div>
            </section>
          )}

          {/* ── AWARDS ───────────────────────────────────────────────── */}
          {hasAwards && (
            <section id="awards" className="scroll-mt-24">
              <SectionLabel>Awards &amp; Recognition</SectionLabel>

              {/* Counter */}
              <div className="mt-10 flex items-baseline gap-12 border-b border-[#1e1e2e] pb-10">
                <div>
                  <span
                    className="font-[family-name:var(--font-display)] text-[5.5rem] font-bold leading-none tabular-nums"
                    style={{ color: awardSummary.totalWins > 0 ? accent : "#3a3a58" }}
                  >
                    {awardSummary.totalWins}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#707090]">
                    Wins
                  </p>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-display)] text-[3.5rem] font-bold leading-none tabular-nums text-[#5a5a7a]">
                    {awardSummary.totalNominations}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#606080]">
                    Nominations
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {awardSummary.ceremonies.map((c) => (
                  <AwardSummaryCard
                    key={c.title}
                    title={c.title}
                    icon={c.icon}
                    wins={c.wins}
                    nominations={c.nominations}
                    records={c.records}
                    accent={accent}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── RATINGS ──────────────────────────────────────────────── */}
          <section id="rate" className="scroll-mt-24">
            <SectionLabel>Ratings</SectionLabel>
            <div className="mt-8">
              <FilmRatingPanel
                filmId={film.id}
                filmTitle={displayTitle(film.title)}
                averageRating={film.averageRating}
                ratingCount={film.ratingCount}
              />
            </div>
          </section>

          <FilmCommentsSection slug={film.slug} accent={accent} />

          {/* ── SIMILAR FILMS ─────────────────────────────────────────── */}
          {similarFilms.length >= 3 && (
            <section id="similar" className="scroll-mt-24">
              <SectionLabel>You Might Also Like</SectionLabel>
              <div className="mt-8">
                <SimilarFilmsSlider
                  films={similarFilms as unknown as Film[]}
                  reasons={similarFilms.map((sf) => {
                    if (film.director && sf.director === film.director)
                      return "Same director";
                    const shared = sf.genres.find((g) =>
                      film.genres.includes(g),
                    );
                    if (shared) return "Same genre";
                    if (sf.year === film.year) return "From the same year";
                    return null;
                  })}
                />
              </div>
            </section>
          )}

          {/* ── CAST ──────────────────────────────────────────────────── */}
          {film.cast.length > 0 && (
            <section id="cast" className="scroll-mt-24">
              <SectionLabel>Cast</SectionLabel>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {normalizeCast(film.cast)
                  .slice(0, 8)
                  .map((member, i) => (
                    <CastCard
                      key={`${member.name}-${i}`}
                      member={member}
                      accent={accent}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* ── WHERE TO WATCH ────────────────────────────────────────── */}
          <WhereToWatch
            watchProviders={film.watchProviders ?? null}
            accent={accent}
          />

          {/* ── TRAILER + META ────────────────────────────────────────── */}
          <div className="grid gap-14 xl:grid-cols-[1fr_240px]">
            {film.trailerUrl ? (
              <div id="trailer" className="scroll-mt-24">
                <SectionLabel>Trailer</SectionLabel>
                <div className="mt-8">
                  <FilmTrailer
                    title={film.title}
                    trailerUrl={film.trailerUrl}
                    youtubeId={youtubeId}
                    thumbnailUrl={film.backdropUrl ?? film.posterUrl}
                  />
                </div>
              </div>
            ) : (
              <section id="trailer" className="scroll-mt-24">
                <SectionLabel>Trailer</SectionLabel>
                <div className="mt-8 flex aspect-video w-full items-center justify-center border border-[#111118] bg-[#07070c]">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#555570]">
                    No trailer available
                  </p>
                </div>
              </section>
            )}

            <div className="flex flex-col gap-10">
              {rankTags.length > 0 && (
                <section>
                  <SectionLabel>Rankings</SectionLabel>
                  <div className="mt-6 flex flex-col gap-2">
                    {rankTags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#25253a] bg-[#0d0d18] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#9898b8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {film.genres.length > 0 && (
                <section>
                  <SectionLabel>Genres</SectionLabel>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {film.genres.map((g) => (
                      <span
                        key={g}
                        className="border border-[#25253a] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#8888a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#d0d0e8]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {film.imdbId && (
                <section>
                  <SectionLabel>Links</SectionLabel>
                  <div className="mt-6">
                    <a
                      href={`https://www.imdb.com/title/${film.imdbId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between border border-[#25253a] bg-[#0d0d18] px-5 py-4 transition-colors hover:border-[#e8453c]/40"
                    >
                      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#9898b8] transition-colors group-hover:text-[#f4f4f5]">
                        IMDb
                      </span>
                      <ExternalLink
                        className="h-3.5 w-3.5 text-[#555570] transition-colors group-hover:text-[#e8453c]"
                        aria-hidden
                      />
                    </a>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Hero meta ─────────────────────────────────────────────────────────────────

/** Middot separator for the factual spec line (year · runtime · language). */
function MetaDot() {
  return (
    <span aria-hidden className="text-white/25">
      ·
    </span>
  );
}

function HeroPill({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-white/80 backdrop-blur-sm"
      style={style}
    >
      {children}
    </span>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8453c]">
        ◆
      </span>
      <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.5em] text-[#c8c8e0]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a42] to-transparent" />
    </div>
  );
}

// ── Award summary card ─────────────────────────────────────────────────────────

function AwardSummaryCard({
  title,
  icon,
  wins,
  nominations,
  records,
  accent,
}: {
  title: string;
  icon: "oscar" | "globe" | "cannes";
  wins: number;
  nominations: number;
  records: AwardRecord[];
  accent: string;
}) {
  const sorted = [...records].sort(
    (a, b) =>
      (b.won ? 1 : 0) - (a.won ? 1 : 0) ||
      a.awardYear - b.awardYear ||
      a.category.localeCompare(b.category),
  );
  const ceremonyCode =
    icon === "oscar" ? "AMPAS" : icon === "globe" ? "HFPA" : "Cannes";

  return (
    <article className="overflow-hidden border border-[#1e1e30]">
      <div className="flex items-center justify-between border-b border-[#1a1a28] bg-[#0d0d18] px-5 py-4">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.55em] text-[#686888]">
            {ceremonyCode}
          </p>
          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#e0e0f0]">
            {title}
          </h3>
        </div>
        <div className="flex items-baseline gap-6">
          <div className="text-right">
            <span
              className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
              style={{ color: wins > 0 ? accent : "#4a4a68" }}
            >
              {wins}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#686888]">
              Wins
            </span>
          </div>
          <div className="text-right">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#686888]">
              {nominations}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#686888]">
              Noms
            </span>
          </div>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="divide-y divide-[#0b0b12]">
          {sorted.map((record) => (
            <div
              key={`${record.awardYear}-${record.category}-${record.nominee}`}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 border-l-2 px-5 py-3.5",
                record.won
                  ? "border-l-[#D4AF37]/50 bg-[#0e0d09]"
                  : "border-l-transparent bg-[#080810]",
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.4em]",
                  record.won ? "text-[#c8a048]" : "text-[#2a2a3a]",
                )}
              >
                {record.won ? "◆ Won" : "Nom"}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[0.8rem] font-medium leading-5",
                    record.won ? "text-[#e8ddb8]" : "text-[#9090a8]",
                  )}
                >
                  {record.category}
                </p>
                <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#666680]">
                  {record.nominee}
                </p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#525268]">
                {record.awardYear}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Cast ──────────────────────────────────────────────────────────────────────

function normalizeCast(raw: unknown[]): CastMember[] {
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, character: "", photoUrl: null };
    const obj = item as Record<string, unknown>;
    return {
      name: (obj.name as string) ?? "",
      character: (obj.character as string) ?? "",
      // API may return either key name — normalise to photoUrl
      photoUrl: (obj.photoUrl ?? obj.profileUrl ?? null) as string | null,
    };
  });
}

function nameInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

function nameHue(name: string): number {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

function CastCard({ member, accent }: { member: CastMember; accent: string }) {
  const initials = nameInitials(member.name);
  const hue = nameHue(member.name);
  return (
    <Link
      href={`/person/${nameToSlug(member.name)}`}
      className="group relative flex flex-col overflow-hidden border border-[#1e1e30] bg-[#0d0d18] transition-colors hover:border-[#e8453c]/30"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "2/3" }}
      >
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover object-top grayscale-[15%] transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4"
            style={{
              background: `linear-gradient(160deg, hsl(${hue},10%,10%) 0%, hsl(${hue},6%,7%) 100%)`,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/8 font-[family-name:var(--font-display)] text-2xl font-bold text-white/22"
              style={{ background: `hsl(${hue},14%,14%)` }}
            >
              {initials}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/30 to-transparent" />
      </div>
      <div className="px-3 pb-4 pt-2.5">
        <p className="truncate text-[0.8rem] font-semibold leading-5 text-[#d4d4e8]">
          {member.name}
        </p>
        {member.character && (
          <p
            className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em]"
            style={{ color: `${accent}cc` }}
          >
            {member.character}
          </p>
        )}
      </div>
    </Link>
  );
}
