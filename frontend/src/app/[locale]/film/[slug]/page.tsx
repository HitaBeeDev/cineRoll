import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowLeft,
  Star,
  Trophy,
  ExternalLink,
  Clapperboard,
  Users,
  Award,
  Gauge,
  RefreshCw,
} from "lucide-react";
import type { Film, AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatRuntime } from "@/lib/format";
import { RollAgainButton } from "@/components/roll-again-button";
import { FilmTrailer } from "@/components/film-trailer";

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
      className="min-h-screen overflow-x-hidden bg-[#07070b] text-[#f4f4f5]"
      style={accentStyle}
    >
      <div className="grid min-h-screen lg:grid-cols-[minmax(320px,400px)_1fr] xl:grid-cols-[420px_1fr]">
        <aside className="border-b border-[#20202d] bg-[#08080d] px-5 py-7 sm:px-8 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-9 lg:py-10">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-2xl font-bold uppercase tracking-[0.24em] text-[#ff4558]"
          >
            Cine-Roll
          </Link>

          <div className="mt-12 flex flex-col gap-7">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-[#20202d] bg-[#0d0d14] shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
              {film.posterUrl ? (
                <Image
                  src={film.posterUrl}
                  alt={`${film.title} poster`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 360px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clapperboard className="h-10 w-10 text-[#343445]" aria-hidden />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatBox
                icon={<Star className="h-3.5 w-3.5" aria-hidden />}
                label="IMDb"
                value={film.imdbRating != null ? film.imdbRating.toFixed(1) : "—"}
                highlight={film.imdbRating != null && film.imdbRating >= 8.0}
              />
              <StatBox
                icon={<Award className="h-3.5 w-3.5" aria-hidden />}
                label="Awards"
                value={
                  totalAwardWins > 0
                    ? `${totalAwardWins}W`
                    : totalAwardNoms > 0
                      ? `${totalAwardNoms}N`
                      : "—"
                }
                highlight={totalAwardWins > 0}
              />
              {film.rtScore != null && (
                <StatBox
                  icon={<Gauge className="h-3.5 w-3.5" aria-hidden />}
                  label="RT"
                  value={`${film.rtScore}%`}
                  highlight={film.rtScore >= 85}
                />
              )}
              {film.imdbTopMovieRank !== null && (
                <StatBox
                  icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
                  label="Top 250"
                  value={`#${film.imdbTopMovieRank}`}
                  highlight
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <RollAgainButton className="h-14 w-full rounded bg-[#ef3347] text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_18px_42px_rgba(239,51,71,0.2)] hover:bg-[#ff4558]" />
              <Link
                href="/"
                className="inline-flex h-14 items-center justify-center gap-3 rounded border border-[#20202d] bg-transparent font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.14em] text-[#f4f4f5] transition-colors hover:border-[#ff4558]/55 hover:text-[#ff4558]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Roll Another
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 pt-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[#777787] transition-colors hover:text-[#f4f4f5]"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back to Browse
              </Link>
            </div>
          </div>
        </aside>

        <section className="relative min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              background: `radial-gradient(ellipse 42% 52% at 100% 0%, ${accent}24, transparent 62%), linear-gradient(90deg, transparent, rgba(18,18,31,0.64))`,
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-14">
            <header className="max-w-5xl pt-2 lg:pt-4">
              <p className="font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.26em] text-[#ff4558] sm:text-sm">
                {film.year}
                {formattedRuntime ? `  •  ${formattedRuntime}` : ""}
                {film.director ? `  •  Dir. ${film.director}` : ""}
              </p>
              <h1 className="mt-8 max-w-5xl text-balance font-sans text-[clamp(3.3rem,7.5vw,7.8rem)] font-black uppercase leading-[0.86] tracking-normal text-[#ededf0]">
                {film.title}
              </h1>
              {film.originalTitle && film.originalTitle !== film.title && (
                <p className="mt-4 font-[family-name:var(--font-display)] text-2xl italic text-[#8c8c9d]">
                  {film.originalTitle}
                </p>
              )}
            </header>

            {film.plot && (
              <blockquote className="max-w-5xl border-l-2 border-[#ff4558] py-1 pl-6 text-xl leading-9 text-[#9696a7] sm:pl-8 sm:text-2xl sm:leading-10">
                {film.plot}
              </blockquote>
            )}

            {hasAwards && (
              <section>
                <EditorialLabel icon={<Award className="h-4 w-4" aria-hidden />}>
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
              <section>
                <EditorialLabel icon={<Users className="h-4 w-4" aria-hidden />}>
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
                <FilmTrailer
                  title={film.title}
                  trailerUrl={film.trailerUrl}
                  youtubeId={youtubeId}
                  thumbnailUrl={film.backdropUrl ?? film.posterUrl}
                />
              ) : (
                <section>
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
                      <ExternalLink className="h-4 w-4 text-[#777787] transition-colors group-hover:text-[#ff4558]" aria-hidden />
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

// ── StatBox ────────────────────────────────────────────────────────────────────

function StatBox({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex min-h-20 flex-col justify-between border px-5 py-4 transition-colors",
      highlight
        ? "border-[#2a2a3a] bg-[#0b0b12] text-[#ff4558]"
        : "border-[#20202d] bg-[#09090f] text-[#f4f4f5]",
    )}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#858596]">
          {label}
        </span>
        <span className={cn("text-[#616174]", highlight && "text-[#ff4558]")}>
          {icon}
        </span>
      </div>
      <span className={cn(
        "font-[family-name:var(--font-geist-mono)] text-2xl font-bold leading-none",
        highlight ? "text-[#ff4558]" : "text-[#f4f4f5]",
      )}>
        {value}
      </span>
    </div>
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
  const firstCategories = summaryRecords.slice(0, 2).map((record) => record.category);
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
      <span className="min-w-0 truncate text-lg text-[#d7d7de]">
        {name}
      </span>
      <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#858596]">
        Actor
      </span>
    </div>
  );
}
