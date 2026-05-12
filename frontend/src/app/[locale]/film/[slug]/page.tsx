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
  Dices,
  Award,
  Gauge,
} from "lucide-react";
import type { Film, AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { RollAgainButton } from "@/components/roll-again-button";
import { AppHeader } from "@/components/app-header";
import { FilmDetailHero } from "@/components/film-detail-hero";
import { FilmTrailer } from "@/components/film-trailer";
import { WatchTonightButton } from "@/components/watch-tonight-button";

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
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#09090f] text-[#F5F5F0]"
      style={accentStyle}
    >
      <AppHeader />

      <main className="flex-1">
        <FilmDetailHero
          title={film.title}
          originalTitle={film.originalTitle}
          year={film.year}
          runtime={film.runtime}
          language={film.language}
          director={film.director}
          backdropUrl={film.backdropUrl}
          posterColor={film.posterColor}
          isPickOfDay={film.isPickOfDay}
        />

        {/* ── CONTENT AREA ───────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:px-8">

          {/* ── 1. POSTER + STATS ──────────────────────────────────── */}
          <section
            className={cn(
              "relative -mt-20 overflow-hidden rounded-[1.35rem] border border-white/10",
              "bg-[#0b0b14]/78 shadow-[0_30px_120px_rgba(0,0,0,0.58)] backdrop-blur-2xl",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background: `radial-gradient(ellipse 44% 80% at 8% 0%, ${accent}2f, transparent 62%), linear-gradient(135deg, rgba(232,69,60,0.1), transparent 34%)`,
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />

            <div className="relative flex flex-col gap-6 p-4 sm:flex-row sm:gap-7 sm:p-5 md:p-6">

            {/* Poster */}
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div
                className="relative aspect-[2/3] w-40 overflow-hidden rounded-2xl border border-white/12 sm:w-48 md:w-56"
                style={{
                  boxShadow: `0 28px 88px rgba(0,0,0,0.92), 0 0 68px 0px ${accent}34`,
                }}
              >
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111118]">
                    <Clapperboard className="h-8 w-8 text-[#2a2a3e]" aria-hidden />
                  </div>
                )}
              </div>
            </div>

            {/* Stats + genres + rank badges */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 text-center sm:text-left">
              <div>
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.24em] text-[#e8453c]">
                  CineRoll dossier
                </p>
                <h2 className="mt-2 text-balance font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[#F5F5F0] sm:text-3xl">
                  {film.title} is ready for your next roll.
                </h2>
                {film.plot && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a6a6b5] line-clamp-3">
                    {film.plot}
                  </p>
                )}
              </div>

              {/* Stat boxes */}
              <div className="grid w-full max-w-xl grid-cols-3 gap-2.5 sm:w-fit sm:min-w-[24rem]">
                <StatBox
                  icon={<Star className="h-3.5 w-3.5" aria-hidden />}
                  label="IMDb"
                  value={
                    film.imdbRating != null
                      ? film.imdbRating.toFixed(1)
                      : "—"
                  }
                  highlight={film.imdbRating != null && film.imdbRating >= 8.0}
                />
                <StatBox
                  icon={<Gauge className="h-3.5 w-3.5" aria-hidden />}
                  label="RT"
                  value={film.rtScore != null ? `${film.rtScore}%` : "—"}
                  highlight={film.rtScore != null && film.rtScore >= 85}
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
              </div>

              {/* IMDb list rank badges */}
              {(film.imdbTopMovieRank !== null || film.imdbTopTvRank !== null) && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {film.imdbTopMovieRank !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      <Trophy className="h-2.5 w-2.5" aria-hidden />
                      IMDb Top 250 Movies #{film.imdbTopMovieRank}
                    </span>
                  )}
                  {film.imdbTopTvRank !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      <Trophy className="h-2.5 w-2.5" aria-hidden />
                      IMDb Top 250 TV #{film.imdbTopTvRank}
                    </span>
                  )}
                </div>
              )}

              {/* Genre pills */}
              {film.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {film.genres.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#a6a6b5]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
            </div>
          </section>

          {/* ── STRIP ──────────────────────────────────────────────── */}
          <FilmStrip className="mt-12 mb-8" />

          {/* ── 2. AWARDS ──────────────────────────────────────────── */}
          {hasAwards && (
            <section>
              <ChannelLabel>Awards &amp; Recognition</ChannelLabel>

              {/* Summary line */}
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  {totalAwardWins} {totalAwardWins === 1 ? "Win" : "Wins"}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#2a2a3e]">
                  ·
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#888899]">
                  {totalAwardNoms}{" "}
                  {totalAwardNoms === 1 ? "Nomination" : "Nominations"}
                </span>
              </div>

              {/* Ceremony cards */}
              <div
                className={cn(
                  "grid grid-cols-1 divide-y divide-[#1a1a28] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b14]/80 shadow-[0_18px_70px_rgba(0,0,0,0.34)]",
                  activeCeremonies.length === 2
                    ? "sm:grid-cols-2 sm:divide-y-0 sm:divide-x"
                    : activeCeremonies.length >= 3
                      ? "md:grid-cols-3 md:divide-y-0 md:divide-x"
                      : "",
                )}
              >
                {activeCeremonies.map((c) => (
                  <CeremonyPanel
                    key={c.title}
                    title={c.title}
                    icon={c.icon}
                    wins={c.wins}
                    nominations={c.nominations}
                    records={c.records}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── STRIP ──────────────────────────────────────────────── */}
          <FilmStrip className={cn(hasAwards ? "mt-10 mb-8" : "mt-0 mb-8")} />

          {/* ── 3. TRAILER + PLOT (left) / CAST + LINKS (right) ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-8 lg:gap-10">

            {/* Left */}
            <div className="flex flex-col gap-8">
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
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-[#1a1a28] bg-[#0b0b14]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#444458]">
                      No trailer available
                    </p>
                  </div>
                </section>
              )}

              {film.plot && (
                <section>
                  <SectionLabel>Plot</SectionLabel>
                  <p className="text-sm leading-7 text-[#a6a6b5]">
                    {film.plot}
                  </p>
                </section>
              )}
            </div>

            {/* Right */}
            <div className="flex flex-col gap-8">

              {/* Cast */}
              {film.cast.length > 0 && (
                <section>
                  <SectionLabel>
                    <Users className="h-3 w-3" aria-hidden />
                    Cast
                  </SectionLabel>
                  <div className="flex flex-col gap-1.5">
                    {(film.cast as string[]).slice(0, 8).map((name, i) => (
                      <CastItem key={name} name={name} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* IMDb link */}
              {film.imdbId && (
                <section>
                  <SectionLabel>External Links</SectionLabel>
                  <a
                    href={`https://www.imdb.com/title/${film.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group inline-flex w-full items-center gap-3",
                      "rounded-xl border border-[#1e1e2a] bg-[#0b0b14]",
                      "px-4 py-3 transition-colors",
                      "hover:border-[#2a2a3e] hover:bg-[#111118]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a3e] bg-[#09090f] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#D4AF37]">
                      IM
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5F5F0]">
                        IMDb
                      </span>
                      <span className="block font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                        View full page
                      </span>
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 shrink-0 text-[#444458] transition-colors group-hover:text-[#888899]"
                      aria-hidden
                    />
                  </a>
                </section>
              )}
            </div>
          </div>

          {/* ── STRIP ──────────────────────────────────────────────── */}
          <FilmStrip className="mt-14 mb-8" />

          {/* ── BOTTOM NAV ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/browse"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl",
                "border border-[#1e1e2a] bg-[#0b0b14]",
                "px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.18em]",
                "text-[#888899] transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to Browse
            </Link>
            <RollAgainButton />
            <Link
              href="/"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl",
                "bg-[#e8453c] text-[#F5F5F0]",
                "px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.18em]",
                "transition-colors hover:bg-[#d5342b]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
              )}
            >
              <Dices className="h-3.5 w-3.5" aria-hidden />
              Roll Another
            </Link>
          </div>

          <WatchTonightButton title={film.title} year={film.year} />
        </div>
      </main>
    </div>
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
      "flex min-h-24 flex-col justify-between rounded-2xl border px-3.5 py-3.5 transition-colors",
      highlight
        ? "border-[#D4AF37]/36 bg-[#D4AF37]/10 shadow-[0_0_34px_rgba(212,175,55,0.1)]"
        : "border-white/10 bg-white/[0.035]",
    )}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#66667a]">
          {label}
        </span>
        <span className={cn("text-[#66667a]", highlight && "text-[#D4AF37]")}>
          {icon}
        </span>
      </div>
      <span className={cn(
        "font-[family-name:var(--font-geist-mono)] text-2xl font-bold leading-none",
        highlight ? "text-[#D4AF37]" : "text-[#F5F5F0]",
      )}>
        {value}
      </span>
    </div>
  );
}

// ── FilmStrip ─────────────────────────────────────────────────────────────────

function FilmStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center", className)} aria-hidden>
      <div className="flex h-5 shrink-0 items-center gap-[4px] border-y border-[#111120] bg-[#060610] px-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>
      <div className="h-px flex-1 bg-[#111120]" />
      <div className="flex h-5 shrink-0 items-center gap-[4px] border-y border-[#111120] bg-[#060610] px-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>
    </div>
  );
}

// ── ChannelLabel ──────────────────────────────────────────────────────────────

function ChannelLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e8453c]/22 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]">
        <Trophy className="h-3 w-3" aria-hidden />
        {children}
      </span>
      <div className="h-px flex-1 bg-[#1a1a28]" />
    </div>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <h2 className="flex shrink-0 items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.28em] text-[#888899]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-[#1a1a28]" />
    </div>
  );
}

// ── CeremonyPanel ─────────────────────────────────────────────────────────────

function CeremonyPanel({
  title,
  icon,
  wins,
  nominations,
  records,
}: {
  title: string;
  icon: "oscar" | "globe" | "cannes";
  wins: number;
  nominations: number;
  records: AwardRecord[];
}) {
  const AwardIcon =
    icon === "globe" ? Star : icon === "cannes" ? Clapperboard : Trophy;

  const sorted = [...records].sort(
    (a, b) =>
      (b.won ? 1 : 0) - (a.won ? 1 : 0) ||
      a.awardYear - b.awardYear ||
      a.category.localeCompare(b.category),
  );

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#1e1e2a] bg-[#09090f]">
          <AwardIcon className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold leading-none text-[#F5F5F0]">
            {title}
          </h3>
        </div>
      </div>

      {/* Big win number */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-[family-name:var(--font-geist-mono)] text-5xl font-bold leading-none tabular-nums",
            wins > 0 ? "text-[#D4AF37]" : "text-[#2a2a3e]",
          )}
        >
          {wins}
        </span>
        <div className="flex flex-col pb-0.5">
          <span
            className={cn(
              "font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.22em]",
              wins > 0 ? "text-[#D4AF37]" : "text-[#444458]",
            )}
          >
            {wins === 1 ? "Win" : "Wins"}
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
            / {nominations} noms
          </span>
        </div>
      </div>

      {/* Category rows */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[#1a1a28] pt-4">
          {sorted.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full",
                  r.won ? "bg-[#D4AF37]" : "bg-[#2a2a3e]",
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-xs font-medium leading-tight",
                    r.won ? "text-[#D4AF37]" : "text-[#888899]",
                  )}
                >
                  {r.category}
                </p>
                {r.nominee && (
                  <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] leading-tight text-[#555568]">
                    {r.nominee}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-1 mt-0.5">
                {r.won && (
                  <span className="rounded-full bg-[#D4AF37] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[#09090f]">
                    Won
                  </span>
                )}
                <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] tabular-nums text-[#333348]">
                  {r.awardYear}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CastItem ──────────────────────────────────────────────────────────────────

function CastItem({ name, index }: { name: string; index: number }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#1a1a28] bg-[#0b0b14] px-3 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2a2a3e] bg-[#111118] font-[family-name:var(--font-geist-mono)] text-[9px] font-bold text-[#555568]">
        {initials}
      </div>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          index === 0 ? "font-medium text-[#F5F5F0]" : "text-[#a6a6b5]",
        )}
      >
        {name}
      </span>
      {index === 0 && (
        <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[7px] font-bold uppercase tracking-[0.2em] text-[#444458]">
          Lead
        </span>
      )}
    </div>
  );
}
