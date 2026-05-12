import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowLeft,
  Star,
  Trophy,
  ExternalLink,
  Play,
  Clapperboard,
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
    // invalid URL
  }
  return null;
}

async function fetchFilm(slug: string): Promise<Film | null> {
  const res = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch film: ${res.status}`);
  const data = (await res.json()) as Film;
  return data;
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
  const filmAccentStyle = {
    "--film-accent": film.posterColor ?? FALLBACK_ACCENT,
  } as CSSProperties;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090f] text-[#F5F5F0]">
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

        <div
          className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8"
          style={filmAccentStyle}
        >
          {/* ── POSTER + META STRIP ─────────────────────────────────── */}
          <div className="-mt-20 sm:-mt-28 flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-end">
            {/* Poster */}
            <div className="relative mx-auto sm:mx-0 shrink-0">
              <div
                className="absolute -inset-8 rounded-full opacity-30 blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, var(--film-accent) 0%, transparent 68%)",
                }}
                aria-hidden
              />
              <div
                className={cn(
                  "relative w-32 sm:w-40 md:w-48 aspect-[2/3] overflow-hidden rounded-xl",
                  "border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]",
                )}
              >
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#111118]">
                    <Clapperboard
                      className="h-8 w-8 text-[#2a2a3e]"
                      aria-hidden
                    />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                      No poster
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ratings + genres */}
            <div className="flex flex-col gap-4 pb-1 text-center sm:text-left">
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {film.imdbRating != null && (
                  <div className="flex flex-col gap-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d14] px-4 py-2.5 min-w-[72px]">
                    <span className="flex items-center justify-center sm:justify-start gap-1">
                      <Star
                        className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]"
                        aria-hidden
                      />
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#888899]">
                        IMDb
                      </span>
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-xl font-bold text-[#F5F5F0] tabular-nums">
                      {film.imdbRating.toFixed(1)}
                    </span>
                  </div>
                )}
                {film.rtScore != null && (
                  <div className="flex flex-col gap-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d14] px-4 py-2.5 min-w-[72px]">
                    <span className="flex items-center justify-center sm:justify-start gap-1">
                      <span className="text-[10px] leading-none" aria-hidden>
                        🍅
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#888899]">
                        RT
                      </span>
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-xl font-bold text-[#F5F5F0] tabular-nums">
                      {film.rtScore}%
                    </span>
                  </div>
                )}
                {hasAwards && (
                  <div className="flex flex-col gap-1 rounded-lg border border-[color:color-mix(in_srgb,var(--film-accent)_25%,#1e1e2a)] bg-[color:color-mix(in_srgb,var(--film-accent)_6%,#0d0d14)] px-4 py-2.5 min-w-[72px]">
                    <span className="flex items-center justify-center sm:justify-start gap-1">
                      <Trophy
                        className="h-3 w-3 text-[var(--film-accent)]"
                        aria-hidden
                      />
                      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#888899]">
                        Awards
                      </span>
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-xl font-bold text-[var(--film-accent)] tabular-nums">
                      {totalAwardWins > 0
                        ? `${totalAwardWins}W`
                        : `${totalAwardNoms}N`}
                    </span>
                  </div>
                )}
              </div>

              {film.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {film.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-[#2a2a3e] bg-[#111118] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#888899]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── FILM STRIP DIVIDER ──────────────────────────────────── */}
          <FilmStripDivider className="mt-10 mb-8" />

          {/* ── MAIN GRID ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-10">
            {/* ── LEFT: Trailer + Synopsis + Cast ─────────────────── */}
            <div className="flex flex-col gap-10">
              {/* Trailer */}
              {film.trailerUrl ? (
                <FilmTrailer
                  title={film.title}
                  trailerUrl={film.trailerUrl}
                  youtubeId={youtubeId}
                  thumbnailUrl={film.backdropUrl ?? film.posterUrl}
                />
              ) : (
                <section>
                  <SectionLabel>
                    <Play className="h-3 w-3 text-[#e8453c]" aria-hidden />
                    Trailer
                  </SectionLabel>
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-[#1a1a28] bg-[#0d0d14]">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#444458]">
                      No trailer available
                    </p>
                  </div>
                </section>
              )}

              {/* Synopsis */}
              {film.plot && (
                <section>
                  <SectionLabel>Synopsis</SectionLabel>
                  <p className="text-[#a6a6b5] leading-7 text-sm">
                    {film.plot}
                  </p>
                </section>
              )}

              {/* Cast */}
              {film.cast.length > 0 && (
                <section>
                  <SectionLabel>Cast</SectionLabel>
                  <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
                    {(film.cast as string[]).slice(0, 10).map((name) => (
                      <CastAvatar
                        key={name}
                        name={name}
                        accentColor={film.posterColor ?? FALLBACK_ACCENT}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT: Awards + Links ────────────────────────────── */}
            <div className="flex flex-col gap-8">
              {/* Awards */}
              {hasAwards && (
                <section>
                  <SectionLabel>
                    <Trophy
                      className="h-3 w-3 text-[var(--film-accent)]"
                      aria-hidden
                    />
                    Awards
                  </SectionLabel>

                  {/* Summary bar */}
                  <div className="mb-4 flex overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#0d0d14]">
                    <div className="flex-1 border-r border-[#1e1e2a] px-4 py-3">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                        Wins
                      </p>
                      <p className="font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-[var(--film-accent)] tabular-nums leading-none mt-1">
                        {totalAwardWins}
                      </p>
                    </div>
                    <div className="flex-1 px-4 py-3">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                        Nominations
                      </p>
                      <p className="font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-[#F5F5F0] tabular-nums leading-none mt-1">
                        {totalAwardNoms}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {film.oscarNominations > 0 && (
                      <AwardSection
                        title="Academy Awards"
                        icon="oscar"
                        wins={film.oscarWins}
                        nominations={film.oscarNominations}
                        records={oscarAwards}
                      />
                    )}
                    {film.ggNominations > 0 && (
                      <AwardSection
                        title="Golden Globes"
                        icon="globe"
                        wins={film.ggWins}
                        nominations={film.ggNominations}
                        records={ggAwards}
                      />
                    )}
                    {film.cannesNominations > 0 && (
                      <AwardSection
                        title="Cannes Film Festival"
                        icon="cannes"
                        wins={film.cannesWins}
                        nominations={film.cannesNominations}
                        records={cannesAwards}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* External links */}
              {film.imdbId && (
                <section>
                  <SectionLabel>Links</SectionLabel>
                  <a
                    href={`https://www.imdb.com/title/${film.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group inline-flex items-center gap-3 w-full",
                      "rounded-lg border border-[#1e1e2a] bg-[#0d0d14]",
                      "px-4 py-3 transition-colors",
                      "hover:border-[#2a2a3e] hover:bg-[#111118]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#2a2a3e] bg-[#09090f] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#D4AF37]">
                      IM
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5F5F0]">
                        IMDb
                      </span>
                      <span className="block font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                        View full page
                      </span>
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 shrink-0 text-[#444458] group-hover:text-[#888899] transition-colors"
                      aria-hidden
                    />
                  </a>
                </section>
              )}
            </div>
          </div>

          {/* ── FILM STRIP DIVIDER ──────────────────────────────────── */}
          <FilmStripDivider className="mt-16 mb-8" />

          {/* ── BOTTOM NAV ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "rounded-xl border border-[#2a2a3e] bg-[#0d0d14]",
                "px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.18em]",
                "text-[#888899] transition-colors hover:border-[#e8453c]/45 hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to Browse
            </Link>
            <RollAgainButton />
          </div>

          <WatchTonightButton title={film.title} year={film.year} />
        </div>
      </main>
    </div>
  );
}

// ── FilmStripDivider ──────────────────────────────────────────────────────────

function FilmStripDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <div className="flex shrink-0 items-center gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[9px] w-[6px] rounded-[1px] bg-[#1a1a28]"
          />
        ))}
      </div>
      <div className="h-px flex-1 bg-[#1a1a28]" />
      <div className="flex shrink-0 items-center gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[9px] w-[6px] rounded-[1px] bg-[#1a1a28]"
          />
        ))}
      </div>
    </div>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <h2 className="flex shrink-0 items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.28em] text-[#888899]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-[#1a1a28]" />
    </div>
  );
}

// ── CastAvatar ────────────────────────────────────────────────────────────────

function CastAvatar({
  name,
  accentColor,
}: {
  name: string;
  accentColor: string;
}) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 w-16">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full border font-[family-name:var(--font-geist-mono)] text-xs font-bold"
        style={{
          background: `color-mix(in srgb, ${accentColor} 12%, #111118)`,
          borderColor: `color-mix(in srgb, ${accentColor} 28%, #2a2a3e)`,
          color: accentColor,
        }}
      >
        {initials}
      </div>
      <p className="w-full text-center font-[family-name:var(--font-geist-mono)] text-[0.6rem] leading-tight text-[#555568] line-clamp-2">
        {name}
      </p>
    </div>
  );
}

// ── AwardSection ──────────────────────────────────────────────────────────────

function AwardSection({
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

  return (
    <div className="overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#0d0d14]">
      {/* Ceremony header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1e1e2a] px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[color:color-mix(in_srgb,var(--film-accent)_28%,#2a2a3e)] bg-[color:color-mix(in_srgb,var(--film-accent)_8%,#09090f)]">
            <AwardIcon
              className="h-3.5 w-3.5 text-[var(--film-accent)]"
              aria-hidden
            />
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold leading-none text-[#F5F5F0] truncate">
            {title}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[var(--film-accent)]">
            {wins}W
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#2a2a3e] mx-1">
            ·
          </span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#888899]">
            {nominations}N
          </span>
        </div>
      </div>

      {/* Individual records */}
      {records.length > 0 && (
        <div className="divide-y divide-[#111118]">
          {records
            .slice()
            .sort(
              (a, b) =>
                a.awardYear - b.awardYear ||
                (b.won ? 1 : 0) - (a.won ? 1 : 0) ||
                a.category.localeCompare(b.category),
            )
            .map((r, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 px-4 py-3",
                  r.won &&
                    "bg-[color:color-mix(in_srgb,var(--film-accent)_5%,transparent)]",
                )}
              >
                <div
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    r.won ? "bg-[var(--film-accent)]" : "bg-[#2a2a3e]",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      r.won ? "text-[var(--film-accent)]" : "text-[#888899]",
                    )}
                  >
                    {r.category}
                  </p>
                  {r.nominee && (
                    <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] text-[#555568]">
                      {r.nominee}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-bold uppercase tracking-[0.12em]",
                      r.won
                        ? "bg-[var(--film-accent)] text-[#09090f]"
                        : "border border-[#2a2a3e] text-[#444458]",
                    )}
                  >
                    {r.won ? "Won" : "Nom"}
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.55rem] text-[#2a2a3e] tabular-nums">
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
