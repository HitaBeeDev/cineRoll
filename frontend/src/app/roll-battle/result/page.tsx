import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clapperboard, Trophy } from "lucide-react";
import type { Film } from "@cineroll/types";
import { AppHeader } from "@/components/app-header";
import { ShareButton } from "@/components/share-button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");

async function fetchFilm(slug: string): Promise<Film | null> {
  const res = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch film: ${res.status}`);
  return res.json() as Promise<Film>;
}

function formatRuntime(runtime: number | null): string {
  if (!runtime) return "";
  const h = Math.floor(runtime / 60);
  const m = runtime % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function buildRollCaption(film: Film): string {
  const parts: string[] = [];
  if (film.oscarWins > 0)
    parts.push(`${film.oscarWins} Oscar ${film.oscarWins === 1 ? "win" : "wins"}`);
  if (film.ggNominations > 0)
    parts.push(`${film.ggNominations} Golden Globe ${film.ggNominations === 1 ? "nomination" : "nominations"}`);
  if (film.cannesWins > 0)
    parts.push(`${film.cannesWins} Cannes ${film.cannesWins === 1 ? "win" : "wins"}`);
  const awardPart = parts.length > 0 ? ` — ${parts.join(", ")}` : "";
  return `Roll Battle picked ${film.title}${awardPart} 🎬 via CineRoll`;
}

function formatAwardSummary(film: Film): string {
  const nominations = film.oscarNominations + film.ggNominations + film.cannesNominations;
  const wins = film.oscarWins + film.ggWins + film.cannesWins;
  if (wins > 0 && nominations > 0) return `${wins} wins · ${nominations} nominations`;
  if (wins > 0) return wins === 1 ? "1 win" : `${wins} wins`;
  if (nominations > 0) return nominations === 1 ? "1 nomination" : `${nominations} nominations`;
  return "CineRoll winner";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ film?: string }>;
}) {
  const { film: slug } = await searchParams;
  if (!slug) return { title: "Roll Battle Result" };
  const film = await fetchFilm(slug);
  if (!film) return { title: "Roll Battle Result" };

  const title = `Roll Battle picked ${film.title}`;
  const description = `${film.title} (${film.year}) won a CineRoll head-to-head battle. ${formatAwardSummary(film)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: film.posterUrl ? [{ url: film.posterUrl, alt: film.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: film.posterUrl ? [film.posterUrl] : [],
    },
  };
}

export default async function RollBattleResultPage({
  searchParams,
}: {
  searchParams: Promise<{ film?: string }>;
}) {
  const { film: slug } = await searchParams;
  if (!slug) notFound();

  const film = await fetchFilm(slug);
  if (!film) notFound();

  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const runtime = formatRuntime(film.runtime);

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090f]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
              Roll Battle Winner
            </span>
            <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
            {film.title}
          </h1>
        </div>

        <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-start">
          <div
            className="relative mx-auto w-48 overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] shadow-[0_0_40px_rgba(212,175,55,0.10)] sm:w-full"
            style={{ aspectRatio: "2/3" }}
          >
            {imageUrl ? (
              <Image src={imageUrl} alt={film.title} fill sizes="(max-width: 640px) 192px, 220px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                {film.year}
              </span>
              {runtime && (
                <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                  {runtime}
                </span>
              )}
              {film.imdbRating != null ? (
                <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                  IMDb {film.imdbRating.toFixed(1)}
                </span>
              ) : (
                <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/30">
                  No IMDb Score
                </span>
              )}
              {film.rtScore != null ? (
                <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/70">
                  RT {film.rtScore}%
                </span>
              ) : (
                <span className="rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#F5F5F0]/30">
                  No RT Score
                </span>
              )}
            </div>

            {film.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {film.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-[#e8453c]/25 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#e8453c]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {film.director && (
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#555568]">
                  Directed by <span className="text-[#F5F5F0]/70">{film.director}</span>
                </p>
              )}
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]">
                {formatAwardSummary(film)}
              </p>
            </div>

            {film.plot && (
              <p className="text-sm leading-6 text-[#F5F5F0]/65 sm:text-base sm:leading-7">
                {film.plot}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/film/${film.slug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
          >
            Watch This Tonight
          </Link>
          <ShareButton
            url={`${SITE_URL}/film/${film.slug}`}
            title={`Roll Battle picked ${film.title} — CineRoll`}
            caption={buildRollCaption(film)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
          />
          <Link
            href="/roll-battle"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
          >
            Play Roll Battle
          </Link>
        </div>
      </main>
    </div>
  );
}
