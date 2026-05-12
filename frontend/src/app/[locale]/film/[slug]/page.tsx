import { notFound } from "next/navigation";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  ExternalLink,
  Play,
  Share2,
  Sparkles,
} from "lucide-react";
import type { Film, AwardRecord, CastMember } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { FilmTrailer } from "@/components/film-trailer";
import { WhereToWatch } from "@/components/where-to-watch";
import { SimilarFilmsSlider } from "@/components/similar-films-slider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");
const FALLBACK_ACCENT = "#D4AF37";

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
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
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
  const shareCardPath = `/api/og/film/${encodeURIComponent(film.slug)}`;

  return (
    <main
      className="min-h-screen bg-[#07070b] text-[#f4f4f5]"
      style={accentStyle}
    >
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
            className="object-cover object-center opacity-45 saturate-[1.15]"
          />
        )}

        {/* Layered gradient overlays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(108deg, rgba(7,7,11,0.97) 0%, rgba(7,7,11,0.82) 46%, rgba(7,7,11,0.08) 100%),
              linear-gradient(to top, rgba(7,7,11,1) 0%, rgba(7,7,11,0.94) 16%, rgba(7,7,11,0.0) 52%),
              radial-gradient(ellipse 52% 58% at 80% 26%, ${accent}22, transparent 68%)
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
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8453c]/35 bg-[#e8453c]/12 px-3 py-1.5 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-[#e8453c]" aria-hidden />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
                      Pick of the Day
                    </span>
                  </div>
                )}

                {/* Metadata pills */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <HeroPill>{film.year}</HeroPill>
                  {formattedRuntime && <HeroPill>{formattedRuntime}</HeroPill>}
                  {film.language && <HeroPill>{film.language}</HeroPill>}
                  {film.certificate && (
                    <HeroPill
                      style={{
                        color: accent,
                        borderColor: `${accent}44`,
                        backgroundColor: `${accent}0e`,
                      }}
                    >
                      {film.certificate}
                    </HeroPill>
                  )}
                  {film.genres.slice(0, 2).map((g) => (
                    <HeroPill key={g}>{g}</HeroPill>
                  ))}
                </div>

                {/* Title */}
                <h1 className="font-[family-name:var(--font-display)] font-bold leading-[0.87] tracking-tight text-[#F5F5F0]" style={{ fontSize: "clamp(3rem,7.5vw,7.5rem)" }}>
                  {film.title}
                </h1>

                {/* Original title */}
                {film.originalTitle && film.originalTitle !== film.title && (
                  <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic text-white/32">
                    {film.originalTitle}
                  </p>
                )}

                {/* Director */}
                {film.director && (
                  <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.32em] text-white/30">
                    A film by{" "}
                    <span className="text-white/55">{film.director}</span>
                  </p>
                )}

                {/* Award tags */}
                {heroAwardTags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {heroAwardTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/8 bg-black/25 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-white/28 backdrop-blur-sm"
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
                  <div className="mt-7 flex items-end gap-7">
                    {film.imdbRating != null && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/22">
                          IMDb
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-[2.25rem] font-bold leading-none text-[#F5F5F0]">
                          {film.imdbRating.toFixed(1)}
                        </p>
                      </div>
                    )}
                    {film.rtScore != null && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/22">
                          RT
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-[2.25rem] font-bold leading-none text-[#F5F5F0]">
                          {film.rtScore}%
                        </p>
                      </div>
                    )}
                    {totalAwardWins > 0 && (
                      <div>
                        <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.5em] text-white/22">
                          Wins
                        </p>
                        <p
                          className="font-[family-name:var(--font-display)] text-[2.25rem] font-bold leading-none"
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
                      className="flex items-center gap-2.5 bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                      Watch Trailer
                    </a>
                  )}
                  <button
                    type="button"
                    className="flex h-11 items-center gap-2 border border-white/10 bg-black/30 px-4 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/40 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Bookmark className="h-3.5 w-3.5" aria-hidden />
                    Watchlist
                  </button>
                  <a
                    href={shareCardPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share this film"
                    className="flex h-11 w-11 items-center justify-center border border-white/10 bg-black/30 text-white/32 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white/58 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </div>

              {/* ── Right: Poster card (desktop only) ──────────────── */}
              {film.posterUrl && (
                <div className="hidden shrink-0 lg:block">
                  <div
                    className="relative h-[400px] w-[267px] rotate-[1.5deg] overflow-hidden"
                    style={{
                      boxShadow: `0 32px 80px rgba(0,0,0,0.82), 0 0 0 1px rgba(255,255,255,0.07), 0 12px 40px ${accent}2a`,
                    }}
                  >
                    <Image
                      src={film.posterUrl}
                      alt={`${film.title} poster`}
                      fill
                      sizes="267px"
                      className="object-cover"
                      priority
                    />
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
      <div className="relative overflow-hidden">
        {/* Ambient glow at top of content */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[80vw] max-w-4xl -translate-x-1/2 blur-3xl"
          style={{
            background: `radial-gradient(ellipse, ${accent}14, transparent 70%)`,
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
                <p className="text-[0.97rem] leading-[1.9] tracking-wide text-[#7a7a92]">
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
              <div className="mt-10 flex items-baseline gap-10 border-b border-[#111118] pb-10">
                <div>
                  <span
                    className="font-[family-name:var(--font-display)] text-[5.5rem] font-bold leading-none tabular-nums"
                    style={{ color: totalAwardWins > 0 ? accent : "#1e1e2a" }}
                  >
                    {totalAwardWins}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#404052]">
                    Wins
                  </p>
                </div>
                <div>
                  <span className="font-[family-name:var(--font-display)] text-[3.5rem] font-bold leading-none tabular-nums text-[#1e1e2a]">
                    {totalAwardNoms}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#303040]">
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
                  <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#252530]">
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
                        className="border border-[#181824] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#484858] transition-colors hover:border-[#e8453c]/25 hover:text-[#b8b8cc]"
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
                      className="group flex items-center justify-between border border-[#161622] bg-[#08080e] px-5 py-4 transition-colors hover:border-[#e8453c]/30"
                    >
                      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#888898] transition-colors group-hover:text-[#f4f4f5]">
                        IMDb
                      </span>
                      <ExternalLink
                        className="h-3.5 w-3.5 text-[#333342] transition-colors group-hover:text-[#e8453c]"
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
      className="rounded-full border border-white/10 bg-black/28 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-white/42 backdrop-blur-sm"
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
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] text-[#e8453c]/50">
        ◆
      </span>
      <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] font-semibold uppercase tracking-[0.58em] text-[#525262]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[#1a1a28] to-transparent" />
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
    <article className="overflow-hidden border border-[#111118]">
      <div className="flex items-center justify-between border-b border-[#111118] bg-[#090910] px-5 py-4">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.55em] text-[#363648]">
            {ceremonyCode}
          </p>
          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#c8c8da]">
            {title}
          </h3>
        </div>
        <div className="flex items-baseline gap-6">
          <div className="text-right">
            <span
              className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
              style={{ color: wins > 0 ? accent : "#232330" }}
            >
              {wins}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.4em] text-[#363648]">
              Wins
            </span>
          </div>
          <div className="text-right">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#232330]">
              {nominations}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.4em] text-[#363648]">
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
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5",
                record.won ? "bg-[#0c0b0a]" : "bg-[#080810]",
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-[family-name:var(--font-geist-mono)] text-[7px] font-bold uppercase tracking-[0.4em]",
                  record.won ? "text-[#b8923c]" : "text-[#2a2a3a]",
                )}
              >
                {record.won ? "◆ Won" : "Nom"}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[0.8rem] font-medium leading-5",
                    record.won ? "text-[#d8cfa8]" : "text-[#686878]",
                  )}
                >
                  {record.category}
                </p>
                <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[#363646]">
                  {record.nominee}
                </p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.3em] text-[#222230]">
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
    <div className="group relative flex flex-col overflow-hidden border border-[#111118] bg-[#08080d] transition-colors hover:border-[#1e1e2c]">
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
            className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/20"
            style={{ background: `hsl(${hue},18%,12%)` }}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/30 to-transparent" />
      </div>
      <div className="px-3 pb-4 pt-2.5">
        <p className="truncate text-[0.75rem] font-semibold leading-5 text-[#b8b8c8]">
          {member.name}
        </p>
        {member.character && (
          <p
            className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: `${accent}88` }}
          >
            {member.character}
          </p>
        )}
      </div>
    </div>
  );
}
