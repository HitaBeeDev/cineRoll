import { notFound } from "next/navigation";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  ExternalLink,
  Play,
  Sparkles,
} from "lucide-react";
import type { Film, AwardRecord, CastMember } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { FilmTrailer } from "@/components/film-trailer";
import { WhereToWatch } from "@/components/where-to-watch";
import { SimilarFilmsSlider } from "@/components/similar-films-slider";
import { ShareButton } from "@/components/share-button";
import { ShareBanner } from "@/components/share-banner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");
const FALLBACK_ACCENT = "#D4AF37";

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
    next: { revalidate: 86400 },
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

function getAwardSummary(film: Film) {
  const wins = film.oscarWins + film.ggWins + film.cannesWins;
  const nominations =
    film.oscarNominations + film.ggNominations + film.cannesNominations;
  const parts = [
    film.oscarNominations > 0 ? `${film.oscarNominations} Oscar` : null,
    film.ggNominations > 0 ? `${film.ggNominations} Golden Globe` : null,
    film.cannesNominations > 0 ? `${film.cannesNominations} Cannes` : null,
  ].filter(Boolean);
  if (wins > 0) return `${wins} wins across ${nominations} major nominations.`;
  if (parts.length > 0) return `${parts.join(", ")} nominations.`;
  return "Explore its CineRoll film profile.";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
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
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: [{ url: socialImage, alt: `${film.title} (${film.year})` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function FilmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams]);
  const [film, similarFilms] = await Promise.all([
    fetchFilm(slug),
    fetchSimilarFilms(slug),
  ]);
  if (!film) notFound();

  const youtubeId = film.trailerUrl ? extractYouTubeId(film.trailerUrl) : null;
  const oscarAwards = (film.oscarCategories as AwardRecord[]) ?? [];
  const ggAwards = (film.ggCategories as AwardRecord[]) ?? [];
  const cannesAwards = (film.cannesCategories as AwardRecord[]) ?? [];
  const totalAwardWins = film.oscarWins + film.ggWins + film.cannesWins;
  const totalAwardNoms =
    film.oscarNominations + film.ggNominations + film.cannesNominations;
  const hasAwards = totalAwardNoms > 0;
  const accent = film.posterColor ?? FALLBACK_ACCENT;
  const formattedRuntime = formatRuntime(film.runtime);

  const heroAwardTags = [
    film.imdbTopMovieRank !== null
      ? `IMDb Top 250 #${film.imdbTopMovieRank}`
      : null,
    film.imdbTopTvRank !== null ? `IMDb Top TV #${film.imdbTopTvRank}` : null,
    film.oscarWins > 0
      ? `${film.oscarWins} Oscar ${film.oscarWins === 1 ? "Win" : "Wins"}`
      : null,
    film.oscarNominations > film.oscarWins && film.oscarNominations > 0
      ? `${film.oscarNominations} Oscar Nom${film.oscarNominations === 1 ? "" : "s"}`
      : null,
    film.ggWins > 0
      ? `${film.ggWins} Globe ${film.ggWins === 1 ? "Win" : "Wins"}`
      : null,
    film.cannesWins > 0
      ? `${film.cannesWins} Cannes ${film.cannesWins === 1 ? "Win" : "Wins"}`
      : null,
  ].filter(Boolean) as string[];

  const accentStyle = { "--film-accent": accent } as CSSProperties;

  const activeCeremonies = [
    film.oscarNominations > 0
      ? {
          title: "Academy Awards",
          icon: "oscar" as const,
          wins: film.oscarWins,
          nominations: film.oscarNominations,
          records: oscarAwards,
        }
      : null,
    film.ggNominations > 0
      ? {
          title: "Golden Globes",
          icon: "globe" as const,
          wins: film.ggWins,
          nominations: film.ggNominations,
          records: ggAwards,
        }
      : null,
    film.cannesNominations > 0
      ? {
          title: "Cannes Film Festival",
          icon: "cannes" as const,
          wins: film.cannesWins,
          nominations: film.cannesNominations,
          records: cannesAwards,
        }
      : null,
  ].filter(Boolean) as {
    title: string;
    icon: "oscar" | "globe" | "cannes";
    wins: number;
    nominations: number;
    records: AwardRecord[];
  }[];

  const heroImageUrl = film.backdropUrl ?? film.posterUrl;

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
            className="object-cover object-center opacity-[0.65] saturate-[1.2]"
          />
        )}

        {/* Layered gradient overlays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(105deg, rgba(7,7,11,0.93) 0%, rgba(7,7,11,0.75) 40%, rgba(7,7,11,0.05) 100%),
              linear-gradient(to top, rgba(7,7,11,1) 0%, rgba(7,7,11,0.90) 12%, rgba(7,7,11,0.0) 46%),
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

        {/* Hero content anchored to bottom */}
        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-end">
          <div className="px-6 pb-14 sm:px-10 lg:px-16 lg:pb-20">
            <div className="flex items-end justify-between gap-8 lg:gap-16">

              {/* ── Left: film info ────────────────────────────────── */}
              <div className="min-w-0 flex-1" style={{ maxWidth: "65ch" }}>

                {/* Pick of day */}
                {film.isPickOfDay && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8453c]/40 bg-[#e8453c]/14 px-3.5 py-2 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-[#e8453c]" aria-hidden />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
                      Pick of the Day
                    </span>
                  </div>
                )}

                {/* Accent rule + Director */}
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="h-px w-12 shrink-0"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                  {film.director && (
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.36em] text-white/35">
                      {film.director}
                    </p>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="font-[family-name:var(--font-display)] font-bold leading-[0.87] tracking-tight text-[#F8F8F4]"
                  style={{ fontSize: "clamp(3rem,7.5vw,7.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
                >
                  {displayTitle(film.title)}
                </h1>

                {/* Original title */}
                {film.originalTitle && film.originalTitle !== film.title && (
                  <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic text-white/30">
                    {film.originalTitle}
                  </p>
                )}

                {/* Metadata pills */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <HeroPill>{film.year}</HeroPill>
                  {formattedRuntime && <HeroPill>{formattedRuntime}</HeroPill>}
                  {film.language && <HeroPill>{film.language}</HeroPill>}
                  {film.certificate && (
                    <HeroPill
                      style={{
                        color: accent,
                        borderColor: `${accent}55`,
                        backgroundColor: `${accent}12`,
                      }}
                    >
                      {film.certificate}
                    </HeroPill>
                  )}
                  {film.genres.slice(0, 2).map((g) => (
                    <HeroPill key={g}>{g}</HeroPill>
                  ))}
                </div>

                {/* Award tags */}
                {heroAwardTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {heroAwardTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/14 bg-black/35 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-white/42 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ratings */}
                {(film.imdbRating != null ||
                  film.rtScore != null ||
                  totalAwardWins > 0) && (
                  <div className="mt-8 flex items-end gap-8">
                    {film.imdbRating != null && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/32">
                          IMDb
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-none text-[#F8F8F4]">
                          {film.imdbRating.toFixed(1)}
                        </p>
                      </div>
                    )}
                    {film.rtScore != null && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/32">
                          RT
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-none text-[#F8F8F4]">
                          {film.rtScore}%
                        </p>
                      </div>
                    )}
                    {totalAwardWins > 0 && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/32">
                          Wins
                        </p>
                        <p
                          className="font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-none"
                          style={{ color: accent }}
                        >
                          {totalAwardWins}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* CTAs */}
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  {film.trailerUrl && (
                    <a
                      href="#trailer"
                      className="flex items-center gap-2.5 bg-[#e8453c] px-7 py-3.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-lg shadow-[#e8453c]/20 transition-all hover:bg-[#d5342b] hover:shadow-[#e8453c]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                      Watch Trailer
                    </a>
                  )}
                  <button
                    type="button"
                    className="flex h-12 items-center gap-2 border border-white/14 bg-white/6 px-5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Bookmark className="h-3.5 w-3.5" aria-hidden />
                    Watchlist
                  </button>
                  <ShareButton
                    url={`${SITE_URL}/film/${film.slug}`}
                    title={`Watch ${displayTitle(film.title)} tonight — CineRoll picked it`}
                    caption={buildShareCaption(film)}
                    className="flex h-12 items-center gap-2 border border-white/14 bg-white/6 px-5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  />
                </div>
              </div>

              {/* ── Right: Poster card (desktop only) ──────────────── */}
              {film.posterUrl && (
                <div className="hidden shrink-0 lg:block">
                  <div
                    className="relative h-[460px] w-[307px] rotate-[1.2deg] overflow-hidden"
                    style={{
                      boxShadow: `0 48px 100px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px ${accent}40`,
                    }}
                  >
                    <Image
                      src={film.posterUrl}
                      alt={`${film.title} poster`}
                      fill
                      sizes="307px"
                      className="object-cover"
                      priority
                    />
                    {/* Poster edge shimmer */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 opacity-25">
          <div className="h-7 w-px bg-gradient-to-b from-transparent to-white" />
          <ChevronDown className="h-3.5 w-3.5 text-white" aria-hidden />
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
                    style={{ color: totalAwardWins > 0 ? accent : "#3a3a58" }}
                  >
                    {totalAwardWins}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#707090]">
                    Wins
                  </p>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-display)] text-[3.5rem] font-bold leading-none tabular-nums text-[#5a5a7a]">
                    {totalAwardNoms}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#606080]">
                    Nominations
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {activeCeremonies.map((c) => (
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
                  <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#555570]">
                    No trailer available
                  </p>
                </div>
              </section>
            )}

            <div className="flex flex-col gap-10">
              {film.genres.length > 0 && (
                <section>
                  <SectionLabel>Genres</SectionLabel>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {film.genres.map((g) => (
                      <span
                        key={g}
                        className="border border-[#25253a] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#8888a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#d0d0e8]"
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
                      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#9898b8] transition-colors group-hover:text-[#f4f4f5]">
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

// ── Hero pill ─────────────────────────────────────────────────────────────────

function HeroPill({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className="rounded-full border border-white/14 bg-black/35 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-white/52 backdrop-blur-sm"
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
      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#e8453c]">
        ◆
      </span>
      <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.5em] text-[#c8c8e0]">
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
          <p className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.55em] text-[#6868888]">
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
            <span className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.4em] text-[#686888]">
              Wins
            </span>
          </div>
          <div className="text-right">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#6868888]">
              {nominations}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.4em] text-[#686888]">
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
                  "shrink-0 font-[family-name:var(--font-geist-mono)] text-[7px] font-bold uppercase tracking-[0.4em]",
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
                <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[#666680]">
                  {record.nominee}
                </p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.3em] text-[#525268]">
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
  return raw.map((item) =>
    typeof item === "string"
      ? { name: item, character: "", profileUrl: null }
      : (item as CastMember),
  );
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
    <div className="group relative flex flex-col overflow-hidden border border-[#1e1e30] bg-[#0d0d18] transition-colors hover:border-[#2e2e48]">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "2/3" }}
      >
        {member.profileUrl ? (
          <Image
            src={member.profileUrl}
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
            className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: `${accent}cc` }}
          >
            {member.character}
          </p>
        )}
      </div>
    </div>
  );
}
