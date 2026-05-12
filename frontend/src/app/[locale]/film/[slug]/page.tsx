import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Star, Trophy, Users, Clapperboard, ExternalLink, UserCircle2 } from "lucide-react";
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
  const data = await res.json() as Film;
  return data;
}

function getAwardSummary(film: Film) {
  const wins = film.oscarWins + film.ggWins + film.cannesWins;
  const nominations = film.oscarNominations + film.ggNominations + film.cannesNominations;
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
  const totalAwardNoms = film.oscarNominations + film.ggNominations + film.cannesNominations;
  const hasAwards = totalAwardNoms > 0;
  const filmAccentStyle = { "--film-accent": film.posterColor ?? FALLBACK_ACCENT } as CSSProperties;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
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
          className="relative mx-auto -mt-16 max-w-4xl px-4 pb-20 sm:-mt-24 sm:px-6 lg:px-8"
          style={filmAccentStyle}
        >
          {/* Poster + core info */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Poster */}
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div
                className="absolute -inset-8 rounded-full opacity-35 blur-3xl"
                style={{ background: "radial-gradient(circle, var(--film-accent) 0%, transparent 68%)" }}
                aria-hidden
              />
              <div
                className={cn(
                  "relative aspect-[2/3] w-36 overflow-hidden rounded-2xl border border-zinc-700",
                  "shadow-2xl shadow-black/70 sm:w-44 md:w-52"
                )}
              >
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
                    fill
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-800">
                    <Clapperboard className="h-8 w-8 text-zinc-600" aria-hidden />
                    <span className="text-xs text-zinc-600">No poster</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-end gap-4 text-center sm:text-left">
              {/* Ratings */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                {film.imdbRating != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="text-sm font-bold text-amber-400 tabular-nums">
                      {film.imdbRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500">IMDb</span>
                  </div>
                )}
                {film.rtScore != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5">
                    <span className="text-sm" aria-hidden>🍅</span>
                    <span className="text-sm font-bold text-zinc-200 tabular-nums">
                      {film.rtScore}%
                    </span>
                    <span className="text-xs text-zinc-500">RT</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {film.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {film.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Two-column grid on desktop: left = trailer + plot, right = cast + awards + links */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-x-10 gap-y-10">
            {/* Left column */}
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
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                    Trailer
                  </h2>
                  <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
                    <p className="text-sm text-zinc-600">No trailer available</p>
                  </div>
                </section>
              )}

              {/* Plot */}
              {film.plot && (
                <section>
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
                    Plot
                  </h2>
                  <p className="text-zinc-300 leading-relaxed">{film.plot}</p>
                </section>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-10">
              {/* Cast */}
              {film.cast.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    Cast
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {(film.cast as string[]).map((name) => (
                      <div
                        key={name}
                        className="flex shrink-0 flex-col items-center gap-2 w-20"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden">
                          <UserCircle2 className="h-10 w-10 text-zinc-700" aria-hidden />
                        </div>
                        <p className="w-full text-center text-[0.65rem] leading-tight text-zinc-400 line-clamp-2">
                          {name}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards */}
              {hasAwards && (
                <section>
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[color:color-mix(in_srgb,var(--film-accent)_72%,rgb(113_113_122))]">
                      <Trophy className="h-3.5 w-3.5 text-[var(--film-accent)]" aria-hidden />
                      Awards
                    </h2>
                    <p className="text-right text-[0.67rem] tabular-nums text-zinc-500">
                      <span className="text-[var(--film-accent)]">{totalAwardWins} {totalAwardWins === 1 ? "win" : "wins"}</span>
                      <span className="mx-1.5 text-zinc-700">·</span>
                      {totalAwardNoms} {totalAwardNoms === 1 ? "nomination" : "nominations"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-6">
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
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
                    External Links
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://www.imdb.com/title/${film.imdbId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900",
                        "px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      )}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      IMDb
                    </a>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700",
                "px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              )}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
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
  const AwardIcon = icon === "globe" ? Star : icon === "cannes" ? Clapperboard : Trophy;

  return (
    <div className="rounded border border-zinc-800 bg-[#0d0d14]/85 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[color:color-mix(in_srgb,var(--film-accent)_32%,rgb(63_63_70))] bg-[color:color-mix(in_srgb,var(--film-accent)_10%,transparent)]">
          <AwardIcon className="h-4 w-4 text-[var(--film-accent)]" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-none text-zinc-100">
            {title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span className="text-[var(--film-accent)]">
              {wins} {wins === 1 ? "win" : "wins"}
            </span>
            <span className="px-2 text-zinc-700" aria-hidden>/</span>
            {nominations} {nominations === 1 ? "nomination" : "nominations"}
          </p>
        </div>
      </div>

      {wins === 0 && (
        <span className="mb-3 inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Nominated
        </span>
      )}

      {records.length > 0 && (
        <div className="flex flex-col gap-2">
          {records
            .slice()
            .sort((a, b) => a.awardYear - b.awardYear || (b.won ? 1 : 0) - (a.won ? 1 : 0) || a.category.localeCompare(b.category))
            .map((r, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded px-3 py-2.5",
                r.won
                  ? "border border-[color:color-mix(in_srgb,var(--film-accent)_36%,rgb(63_63_70))] bg-[color:color-mix(in_srgb,var(--film-accent)_8%,transparent)]"
                  : "border border-zinc-800 bg-zinc-950/55"
              )}
            >
              <AwardIcon
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  r.won ? "fill-[var(--film-accent)] text-[var(--film-accent)]" : "fill-transparent text-zinc-700"
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.12em]", r.won ? "text-[var(--film-accent)]" : "text-zinc-400")}>
                  {r.category}
                </p>
                {r.nominee && (
                  <p className="mt-1 text-xs text-zinc-500">{r.nominee}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em]",
                  r.won
                    ? "bg-[var(--film-accent)] text-zinc-950"
                    : "border border-zinc-700 text-zinc-500"
                )}>
                  {r.won ? "Won" : "Nom"}
                </span>
                <span className="text-[0.65rem] tabular-nums text-zinc-700">{r.awardYear}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
