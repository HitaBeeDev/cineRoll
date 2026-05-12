import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Bookmark, ExternalLink, Share2 } from "lucide-react";
import type { Film, AwardRecord, CastMember } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { FilmTrailer } from "@/components/film-trailer";
import { AnimatedJumpLink } from "@/components/animated-jump-link";
import { WhereToWatch } from "@/components/where-to-watch";
import { SimilarFilmsSlider } from "@/components/similar-films-slider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
  const socialImage = film.posterUrl ?? film.backdropUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: socialImage
        ? [{ url: socialImage, alt: `${film.title} (${film.year})` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImage ? [socialImage] : [],
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
  const sidebarImageUrl = film.backdropUrl ?? film.posterUrl;
  const sidebarAwardTags = [
    film.imdbTopMovieRank !== null
      ? `IMDb Top 250 Movies #${film.imdbTopMovieRank}`
      : null,
    film.imdbTopTvRank !== null
      ? `IMDb Top 250 TV #${film.imdbTopTvRank}`
      : null,
    film.oscarWins > 0
      ? `+ ${film.oscarWins} Oscar ${film.oscarWins === 1 ? "Win" : "Wins"}`
      : null,
    film.oscarNominations > film.oscarWins
      ? `+ ${film.oscarNominations} Oscar Nom${film.oscarNominations === 1 ? "" : "s"}`
      : null,
    film.ggWins > 0
      ? `+ ${film.ggWins} GG ${film.ggWins === 1 ? "Win" : "Wins"}`
      : null,
    film.ggNominations > film.ggWins
      ? `+ ${film.ggNominations} GG Nom${film.ggNominations === 1 ? "" : "s"}`
      : null,
    film.cannesWins > 0
      ? `+ ${film.cannesWins} Cannes ${film.cannesWins === 1 ? "Win" : "Wins"}`
      : null,
    film.cannesNominations > film.cannesWins
      ? `+ ${film.cannesNominations} Cannes Nom${film.cannesNominations === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

  const accentStyle = {
    "--film-accent": accent,
  } as CSSProperties;

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

  return (
    <main
      className="min-h-screen bg-[#07070b] text-[#f4f4f5]"
      style={accentStyle}
    >
      <AppHeader />
      <div className="min-h-[calc(100vh-4rem)] lg:block">
        {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
        <aside className="border-b border-[#20202d] bg-[#08080d] px-4 py-6 sm:px-6 lg:fixed lg:bottom-0 lg:left-0 lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:w-[41.666667%] lg:border-b-0 lg:border-r lg:p-4">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="flex flex-col">
              <div className="-mx-1 -mt-1 mb-2 flex items-center">
                <span className="inline-flex max-w-full items-center rounded-full border border-[#e8453c]/22 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]">
                  Reel // {film.title.toUpperCase()}
                </span>
              </div>

              <div className="relative aspect-video w-full overflow-hidden border border-[#171724] bg-[#0d0d14]">
                {sidebarImageUrl ? (
                  <Image
                    src={sidebarImageUrl}
                    alt={film.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a18]">
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
                      No image
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f]/55 to-transparent" />
              </div>

              <div className="flex flex-col gap-2 p-4">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#888899]">
                  {film.genres.length > 0
                    ? film.genres.join(" · ")
                    : "Genres unavailable"}
                </p>

                <div className="mt-1 flex items-start justify-between gap-3">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[#F5F5F0] sm:text-2xl">
                    {film.title}
                  </h2>
                  <button
                    type="button"
                    aria-label="Add to watchlist"
                    className="mt-0.5 shrink-0 text-[#555568] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Bookmark className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <HomeStyleStatBox
                    label="IMDb"
                    value={
                      film.imdbRating != null ? film.imdbRating.toFixed(1) : "—"
                    }
                  />
                  <HomeStyleStatBox
                    label="RT"
                    value={film.rtScore != null ? `${film.rtScore}%` : "—"}
                  />
                  <HomeStyleStatBox
                    label="Awards"
                    value={
                      totalAwardWins > 0
                        ? `${totalAwardWins}W`
                        : totalAwardNoms > 0
                          ? `${totalAwardNoms}N`
                          : "—"
                    }
                  />
                </div>

                {sidebarAwardTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sidebarAwardTags.map((tag) => (
                      <DetailAwardTag key={tag}>{tag}</DetailAwardTag>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 px-4 pb-4">
              {(film.trailerUrl || film.cast.length > 0) && (
                <div className="flex items-center gap-2">
                  {film.trailerUrl && (
                    <AnimatedJumpLink href="#trailer">Jump to Trailer</AnimatedJumpLink>
                  )}
                  {film.cast.length > 0 && (
                    <AnimatedJumpLink href="#cast">Jump to Cast</AnimatedJumpLink>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className={cn(
                    "flex h-11 flex-1 items-center justify-center rounded-xl",
                    "bg-[#e8453c] text-[#F5F5F0]",
                    "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em]",
                    "transition-colors hover:bg-[#d5342b]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  )}
                >
                  Back Home
                </Link>
                <DetailActionButton>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest">
                    Watched
                  </span>
                </DetailActionButton>
                <DetailActionButton>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest">
                    Pass
                  </span>
                </DetailActionButton>
                <DetailActionButton aria-label="Share this film">
                  <Share2 className="h-4 w-4" aria-hidden />
                </DetailActionButton>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
        <section
          id="details"
          className="relative min-w-0 scroll-mt-24 px-6 py-12 sm:px-8 lg:ml-[41.666667%] lg:w-[58.333333%] lg:px-12 lg:py-16 xl:px-16"
        >
          {/* Layered atmospheric glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 40% at 100% 0%, ${accent}16, transparent 55%),
                radial-gradient(ellipse 50% 60% at 15% 100%, ${accent}09, transparent 65%)
              `,
            }}
          />

          <div className="relative mx-auto flex max-w-5xl flex-col gap-14">

            {/* ── HEADER ─────────────────────────────────────────────── */}
            <header>
              {/* Year · Runtime centered in a decorative rule */}
              <div className="mb-8 flex items-center gap-5">
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to right, transparent, ${accent}55)`,
                  }}
                />
                <p className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.55em] text-[#e8453c]/70">
                  {film.year}
                  {formattedRuntime ? `  ·  ${formattedRuntime}` : ""}
                </p>
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to left, transparent, ${accent}55)`,
                  }}
                />
              </div>

              <h1 className="text-balance font-[family-name:var(--font-display)] text-[clamp(2.8rem,6.5vw,5.5rem)] font-bold leading-[0.9] tracking-tight text-[#F5F5F0]">
                {film.title}
              </h1>

              {film.originalTitle && film.originalTitle !== film.title && (
                <p className="mt-5 font-[family-name:var(--font-display)] text-[1.35rem] italic text-[#56566a]">
                  {film.originalTitle}
                </p>
              )}

              {film.director && (
                <div className="mt-8 flex items-center gap-4">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.45em] text-[#363648]">
                    Directed by
                  </span>
                  <div className="h-px w-6 bg-[#222232]" />
                  <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#7878909a]">
                    {film.director}
                  </span>
                </div>
              )}
            </header>

            {/* ── SYNOPSIS ───────────────────────────────────────────── */}
            {film.plot && (
              <div className="relative pl-7">
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${accent}cc, ${accent}22, transparent)`,
                  }}
                />
                <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.65em] text-[#e8453c]/50">
                  Synopsis
                </p>
                <p className="font-[family-name:var(--font-geist-mono)] text-[0.77rem] uppercase leading-[2.5] tracking-[0.13em] text-[#5e5e74]">
                  {film.plot}
                </p>
              </div>
            )}

            {/* ── AWARDS ─────────────────────────────────────────────── */}
            {hasAwards && (
              <section id="awards" className="relative scroll-mt-24">
                {/* Ghost number backdrop */}
                <div
                  className="pointer-events-none absolute -right-2 -top-16 select-none font-[family-name:var(--font-display)] text-[13rem] font-bold leading-none tabular-nums text-white/[0.022]"
                  aria-hidden
                >
                  {totalAwardWins > 0 ? totalAwardWins : totalAwardNoms}
                </div>

                <div className="relative">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.65em] text-[#e8453c]/50">
                    ◆&nbsp;&nbsp;Awards Season&nbsp;&nbsp;◆
                  </p>
                  <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.5vw,3.75rem)] font-bold leading-[1.02] text-[#F5F5F0]">
                    Awards &amp;<br />Recognition
                  </h2>

                  {/* Big wins / noms counter */}
                  <div className="mt-10 flex items-baseline gap-10 border-b border-[#111118] pb-10">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-[family-name:var(--font-display)] text-[5rem] font-bold leading-none tabular-nums"
                        style={{ color: totalAwardWins > 0 ? accent : "#252532" }}
                      >
                        {totalAwardWins}
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#404052]">
                        Wins
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-[family-name:var(--font-display)] text-[3.25rem] font-bold leading-none tabular-nums text-[#222230]">
                        {totalAwardNoms}
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#303040]">
                        Nominations
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-5">
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

            {/* ── YOU MIGHT ALSO LIKE ────────────────────────────────── */}
            {similarFilms.length > 0 && (
              <section id="similar" className="scroll-mt-24">
                <CinematicSectionLabel>You Might Also Like</CinematicSectionLabel>
                <div className="mt-8">
                  <SimilarFilmsSlider films={similarFilms as unknown as Film[]} />
                </div>
              </section>
            )}

            {/* ── CAST ───────────────────────────────────────────────── */}
            {film.cast.length > 0 && (
              <section id="cast" className="scroll-mt-24">
                <CinematicSectionLabel>Cast</CinematicSectionLabel>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {normalizeCast(film.cast).slice(0, 8).map((member, i) => (
                    <CastCard
                      key={`${member.name}-${i}`}
                      member={member}
                      accent={accent}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── WHERE TO WATCH ─────────────────────────────────────── */}
            <WhereToWatch watchProviders={film.watchProviders ?? null} accent={accent} />

            {/* ── TRAILER + META ─────────────────────────────────────── */}
            <div className="grid gap-14 xl:grid-cols-[1fr_240px]">
              {film.trailerUrl ? (
                <div id="trailer" className="scroll-mt-24">
                  <CinematicSectionLabel>Trailer</CinematicSectionLabel>
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
                  <CinematicSectionLabel>Trailer</CinematicSectionLabel>
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
                    <CinematicSectionLabel>Genres</CinematicSectionLabel>
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
                    <CinematicSectionLabel>Links</CinematicSectionLabel>
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
        </section>
      </div>
    </main>
  );
}

// ── Left sidebar helpers ───────────────────────────────────────────────────────

function HomeStyleStatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d1a] px-3 py-2.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-base font-bold text-[#F5F5F0]">
        {value}
      </span>
    </div>
  );
}

function DetailAwardTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1e1e2a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#888899]">
      {children}
    </span>
  );
}

function DetailActionButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 items-center justify-center rounded-xl px-3",
        "border border-[#1e1e2a] text-[#555568]",
        "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Right column shared components ────────────────────────────────────────────

function CinematicSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] text-[#e8453c]/40">
        ◆
      </span>
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.6em] text-[#484858]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[#1a1a26] to-transparent" />
    </div>
  );
}

// ── Award components ───────────────────────────────────────────────────────────

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
      {/* Card header */}
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

      {/* Award rows */}
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

// ── Cast components ────────────────────────────────────────────────────────────

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
      {/* Portrait image — 2:3 aspect ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
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
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/30 to-transparent" />
      </div>

      {/* Name + character */}
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
