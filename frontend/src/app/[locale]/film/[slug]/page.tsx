import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Star, Trophy, Users, Clapperboard, ExternalLink, PlayCircle } from "lucide-react";
import type { Film, AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { RollAgainButton } from "@/components/roll-again-button";
import { SiteNavigation } from "@/components/site-navigation";
import { FilmDetailHero } from "@/components/film-detail-hero";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const film = await fetchFilm(slug);
  if (!film) return { title: "Film Not Found" };

  const title = `${film.title} (${film.year})`;

  const rawDescription = film.plot
    ?? `${film.title}${film.director ? `, directed by ${film.director}` : ""}.`;
  const description =
    rawDescription.length > 155
      ? `${rawDescription.slice(0, 152)}…`
      : rawDescription;

  // Prefer backdrop for large-image social cards (landscape); fall back to poster
  const socialImage = film.backdropUrl ?? film.posterUrl;

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
  const hasAwards = film.oscarNominations > 0 || film.ggNominations > 0;
  const filmAccentStyle = { "--film-accent": film.posterColor ?? FALLBACK_ACCENT } as CSSProperties;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800/60 bg-[rgba(9,9,15,0.85)] px-5 py-4 backdrop-blur-[20px] sm:px-8">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.08em] text-[#D4AF37] transition-colors hover:text-[#F1D27A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">
          CineRoll
        </Link>
        <SiteNavigation focusRingClassName="focus-visible:ring-amber-400" />
      </header>

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
              {film.trailerUrl && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    <PlayCircle className="h-3.5 w-3.5 text-[var(--film-accent)]" aria-hidden />
                    Trailer
                  </h2>
                  {youtubeId ? (
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                          title={`${film.title} trailer`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <a
                      href={film.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl border bg-zinc-800",
                        "px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700",
                        "border-[color:color-mix(in_srgb,var(--film-accent)_45%,rgb(63_63_70))] hover:text-[var(--film-accent)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      )}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      Watch Trailer
                    </a>
                  )}
                  {youtubeId && (
                    <a
                      href={film.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 mt-2",
                        "text-xs text-zinc-500 transition-colors hover:text-[var(--film-accent)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                      )}
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden />
                      Watch on YouTube
                    </a>
                  )}
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
                  <div className="flex flex-wrap gap-2">
                    {film.cast.map((name) => (
                      <span
                        key={name}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards */}
              {hasAwards && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[color:color-mix(in_srgb,var(--film-accent)_72%,rgb(113_113_122))]">
                    <Trophy className="h-3.5 w-3.5 text-[var(--film-accent)]" aria-hidden />
                    Awards
                  </h2>
                  <div className="flex flex-col gap-6">
                    {film.oscarNominations > 0 && (
                      <AwardSection
                        title="Academy Awards"
                        wins={film.oscarWins}
                        nominations={film.oscarNominations}
                        records={oscarAwards}
                      />
                    )}
                    {film.ggNominations > 0 && (
                      <AwardSection
                        title="Golden Globes"
                        wins={film.ggWins}
                        nominations={film.ggNominations}
                        records={ggAwards}
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
        </div>
      </main>
    </div>
  );
}

function AwardSection({
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
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        <span className="text-xs text-zinc-500">
          {wins > 0 ? (
            <span className="text-amber-400 font-medium">
              {wins} {wins === 1 ? "win" : "wins"}
            </span>
          ) : null}
          {wins > 0 && nominations > wins ? " · " : null}
          {nominations > wins ? `${nominations} nominations` : null}
          {wins > 0 && nominations === wins ? ` across ${nominations} nominations` : null}
        </span>
      </div>

      {records.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {records
            .slice()
            .sort((a, b) => a.awardYear - b.awardYear || (b.won ? 1 : 0) - (a.won ? 1 : 0) || a.category.localeCompare(b.category))
            .map((r, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2.5 rounded-lg px-3 py-2",
                r.won
                  ? "border border-amber-400/15 bg-amber-400/5"
                  : "border border-zinc-800 bg-zinc-900/60"
              )}
            >
              <Trophy
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  r.won ? "text-amber-400" : "text-zinc-700"
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className={cn("text-xs font-medium", r.won ? "text-amber-400" : "text-zinc-400")}>
                  {r.category}
                  {r.won && (
                    <span className="ml-1.5 font-normal text-zinc-500">· Won</span>
                  )}
                </p>
                {r.nominee && (
                  <p className="text-xs text-zinc-500 mt-0.5">{r.nominee}</p>
                )}
                <p className="text-xs text-zinc-700 mt-0.5">{r.awardYear} ceremony</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
