import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import {
  Bookmark,
  ExternalLink,
  Users,
  Award,
  Share2,
} from "lucide-react";
import type { Film, AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { FilmTrailer } from "@/components/film-trailer";
import { AnimatedJumpLink } from "@/components/animated-jump-link";

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
  const film = await fetchFilm(slug);
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

        <section
          id="details"
          className="relative min-w-0 scroll-mt-24 px-5 py-10 sm:px-7 lg:ml-[41.666667%] lg:w-[58.333333%] lg:px-10 lg:py-12 xl:px-12"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              background: `radial-gradient(ellipse 42% 52% at 100% 0%, ${accent}24, transparent 62%), linear-gradient(90deg, transparent, rgba(18,18,31,0.64))`,
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-14">
            <header className="max-w-5xl pt-2 lg:pt-4">
              <p className="font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.3em] text-[#e8453c]/70">
                {film.year}
                {formattedRuntime ? `  •  ${formattedRuntime}` : ""}
                {film.director ? `  •  Dir. ${film.director}` : ""}
              </p>
              <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.75rem)] font-bold leading-none tracking-tight text-[#F5F5F0]">
                {film.title}
              </h1>
              {film.originalTitle && film.originalTitle !== film.title && (
                <p className="mt-4 font-[family-name:var(--font-display)] text-2xl italic text-[#8c8c9d]">
                  {film.originalTitle}
                </p>
              )}
            </header>

            {film.plot && (
              <blockquote className="max-w-5xl border-l-2 border-[#ff4558] py-1 pl-5 font-[family-name:var(--font-geist-mono)] text-[0.8rem] uppercase leading-8 tracking-[0.16em] text-[#8d8da1] sm:pl-6">
                {film.plot}
              </blockquote>
            )}

            {hasAwards && (
              <section id="awards" className="scroll-mt-24">
                <EditorialLabel
                  icon={<Award className="h-4 w-4" aria-hidden />}
                >
                  Awards &amp; Recognition
                </EditorialLabel>
                <div className="mt-7 grid gap-4">
                  {activeCeremonies.map((c) => (
                    <AwardSummaryCard
                      key={c.title}
                      title={c.title}
                      wins={c.wins}
                      nominations={c.nominations}
                      records={c.records}
                    />
                  ))}
                </div>
              </section>
            )}

            {film.cast.length > 0 && (
              <section id="cast" className="scroll-mt-24">
                <EditorialLabel
                  icon={<Users className="h-4 w-4" aria-hidden />}
                >
                  Cast
                </EditorialLabel>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {(film.cast as string[]).slice(0, 8).map((name) => (
                    <CastItem key={name} name={name} />
                  ))}
                </div>
              </section>
            )}

            <div className="grid gap-10 xl:grid-cols-[1fr_300px]">
              {film.trailerUrl ? (
                <div id="trailer" className="scroll-mt-24">
                  <FilmTrailer
                    title={film.title}
                    trailerUrl={film.trailerUrl}
                    youtubeId={youtubeId}
                    thumbnailUrl={film.backdropUrl ?? film.posterUrl}
                  />
                </div>
              ) : (
                <section id="trailer" className="scroll-mt-24">
                  <SectionLabel>Trailer</SectionLabel>
                  <div className="flex aspect-video w-full items-center justify-center border border-[#1a1a28] bg-[#0b0b14]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#444458]">
                      No trailer available
                    </p>
                  </div>
                </section>
              )}

              <div className="flex flex-col gap-6">
                {film.genres.length > 0 && (
                  <section>
                    <SectionLabel>Genres</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {film.genres.map((g) => (
                        <span
                          key={g}
                          className="border border-[#20202d] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-[#9a9aaa]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {film.imdbId && (
                  <section>
                    <SectionLabel>External Links</SectionLabel>
                    <a
                      href={`https://www.imdb.com/title/${film.imdbId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-full items-center justify-between border border-[#20202d] px-5 py-4 font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#f4f4f5] transition-colors hover:border-[#ff4558]/55 hover:text-[#ff4558]"
                    >
                      IMDb
                      <ExternalLink
                        className="h-4 w-4 text-[#777787] transition-colors group-hover:text-[#ff4558]"
                        aria-hidden
                      />
                    </a>
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

function EditorialLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em] text-[#f4f4f5]">
      <span className="text-[#ff4558]">{icon}</span>
      {children}
    </h2>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <h2 className="flex shrink-0 items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.24em] text-[#888899]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-[#1a1a28]" />
    </div>
  );
}

function AwardSummaryCard({
  title,
  wins,
  nominations,
  records,
}: {
  title: string;
  wins: number;
  nominations: number;
  records: AwardRecord[];
}) {
  const sorted = [...records].sort(
    (a, b) =>
      (b.won ? 1 : 0) - (a.won ? 1 : 0) ||
      a.awardYear - b.awardYear ||
      a.category.localeCompare(b.category),
  );
  const wonRecords = sorted.filter((record) => record.won);
  const summaryRecords = wonRecords.length > 0 ? wonRecords : sorted;
  const firstCategories = summaryRecords
    .slice(0, 2)
    .map((record) => record.category);
  const remainingCount = Math.max(nominations - firstCategories.length, 0);
  const categorySummary =
    firstCategories.length > 0
      ? `${firstCategories.join(", ")}${remainingCount > 0 ? `, and ${remainingCount} more` : ""}`
      : `${nominations} ${nominations === 1 ? "nomination" : "nominations"}`;

  return (
    <div className="flex items-center justify-between gap-6 border border-[#20202d] bg-[#08080d]/70 px-5 py-5 sm:px-6">
      <div className="min-w-0">
        <h3 className="text-xl font-bold leading-tight text-[#f4f4f5]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#858596] sm:text-base">
          {categorySummary}
        </p>
      </div>
      <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-4xl font-bold leading-none text-[#ff4558]">
        {wins > 0 ? wins : nominations}
      </span>
    </div>
  );
}

// ── CastItem ──────────────────────────────────────────────────────────────────

function CastItem({ name }: { name: string }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border border-[#181823] bg-[#08080d]/62 px-5 py-4">
      <span className="min-w-0 truncate text-lg text-[#d7d7de]">{name}</span>
      <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#858596]">
        Actor
      </span>
    </div>
  );
}
