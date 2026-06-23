"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Film } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { trackEvent, trackFilmImpression } from "@/lib/analytics";

type AwardBadge = {
  detail: string;
  // "marquee" = the rare, heavily-decorated films that get loud emphasis;
  // "quiet" = everyone else, who still earn a badge but a recessive one.
  tier: "marquee" | "quiet";
} | null;

// Every film in the DB is an award film, so a loud badge on each one carries no
// signal. Browse defaults to awards-descending, so page one is the most-decorated
// films — keep the marquee threshold high enough that even there the emphatic
// badge stays rare and doesn't become a wall of accent colour.
const MARQUEE_WIN_THRESHOLD = 10;

function getAwardBadge(film: Film): AwardBadge {
  // One combined count across every award body — no single body is named, so
  // the number can't be misread as "11 Oscars" when it's 11 awards in total.
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const totalNoms = film.oscarNominations + film.ggNominations + film.cannesNominations + film.berlinNominations;

  if (totalWins > 0)
    return {
      detail: `${totalWins} ${totalWins === 1 ? "award" : "awards"}`,
      tier: totalWins >= MARQUEE_WIN_THRESHOLD ? "marquee" : "quiet",
    };
  if (totalNoms > 0)
    return { detail: `${totalNoms} ${totalNoms === 1 ? "nom" : "noms"}`, tier: "quiet" };
  return null;
}

function getListBadge(film: Film) {
  if (film.imdbTopMovieRank != null) {
    return { label: "IMDb Top 250 Film", detail: `#${film.imdbTopMovieRank}` };
  }
  if (film.imdbTopTvRank != null) {
    return { label: "IMDb Top 250 TV", detail: `#${film.imdbTopTvRank}` };
  }
  return null;
}

interface FilmCardProps {
  film: Film & {
    averageRating?: number | null;
    ratingCount?: number;
  };
  className?: string | undefined;
}

export function FilmCard({ film, className }: FilmCardProps) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const badge = getAwardBadge(film);
  const listBadge = getListBadge(film);
  const primaryGenre = film.genres[0] ?? film.contentType;
  const averageRating = film.averageRating ?? null;
  const ratingCount = film.ratingCount ?? 0;
  const showAverageRating = averageRating !== null && ratingCount > 0;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackFilmImpression(film.id, {
          title: film.title,
          slug: film.slug,
          surface: "shared_film_card",
        });
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [film.id, film.slug, film.title]);

  return (
    <Link
      ref={cardRef}
      href={`/film/${film.slug}`}
      onClick={() => {
        trackEvent({
          type: "film_click",
          filmId: film.id,
          context: {
            source: "film_card",
            slug: film.slug,
          },
        });
      }}
      aria-label={`${film.title} (${film.year})`}
      className={cn("group block w-full min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]", className)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18] group-hover:shadow-[0_26px_60px_rgba(0,0,0,0.48)]">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#151520,#0b0b12)]">
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#555064]">
              No Poster
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_52%,rgba(0,0,0,0.76)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />

        {(listBadge || badge) && (
          <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-col items-start gap-1.5">
            {listBadge && (
              <span
                aria-label={`${listBadge.label} ${listBadge.detail}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#D4AF37]/45 bg-black/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f2d86f] shadow-lg shadow-black/25 backdrop-blur-sm"
              >
                <span className="truncate">{listBadge.label}</span>
                <span className="shrink-0 text-[#f8f0b3]">{listBadge.detail}</span>
              </span>
            )}
            {badge && (badge.tier === "marquee" ? (
              <span
                aria-label={badge.detail}
                className="inline-flex max-w-full items-center rounded-full border border-white/25 bg-white/[0.12] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5f3fb] shadow-lg shadow-black/25 backdrop-blur-sm"
              >
                <span className="shrink-0">{badge.detail}</span>
              </span>
            ) : (
              <span
                aria-label={badge.detail}
                className="inline-flex max-w-full items-center rounded-full border border-white/12 bg-black/55 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[#b7b2c4] backdrop-blur-sm"
              >
                <span className="shrink-0">{badge.detail}</span>
              </span>
            ))}
          </div>
        )}

        {showAverageRating && (
          <span
            aria-label={`CineRoll average rating ${averageRating.toFixed(1)} from ${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"}`}
            title={`CineRoll average ${averageRating.toFixed(1)}/10`}
            className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-[#e8453c]/35 bg-black/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold tracking-[0.1em] text-[#ff8a82] shadow-lg shadow-black/25 backdrop-blur-sm"
          >
            <Star className="h-3 w-3 fill-current" aria-hidden />
            {averageRating.toFixed(1)}
          </span>
        )}

        <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center justify-between gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-white backdrop-blur-md">
            Open
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#f5c518]/30 bg-black/60 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold tracking-[0.08em] text-[#f5c518] backdrop-blur-md">
              <ImdbIcon />
              {film.imdbRating != null ? film.imdbRating : "—"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#fa320a]/30 bg-black/60 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold tracking-[0.08em] text-[#ff6b47] backdrop-blur-md">
              <TomatoIcon />
              {film.rtScore != null ? `${film.rtScore}%` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Info below poster — always visible */}
      <div className="pt-3">
        <h3 className="line-clamp-1 text-[14px] font-semibold leading-snug text-[#eeeaf6] transition-colors group-hover:text-white sm:text-[15px]">
          {film.title}
        </h3>
        <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#9d98ad]">
          {film.year}
          <span className="text-[#6f6a80]"> · {primaryGenre}</span>
        </p>
      </div>
    </Link>
  );
}

function ImdbIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden>
      <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5" />
    </svg>
  );
}

function TomatoIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden>
      <ellipse cx="6" cy="7" rx="4.5" ry="4" />
      <path d="M6 3 Q7.5 1 9 1.5 Q8 3 6 3Z" opacity="0.85" />
      <path d="M6 3 Q4.5 1 3 1.5 Q4 3 6 3Z" opacity="0.7" />
    </svg>
  );
}

export function FilmCardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("block", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <div className="space-y-2 pt-3">
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
