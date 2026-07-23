"use client";

import Link from "next/link";
import Image from "next/image";
import type { AwardBodyFilter, Film } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { formatFilmYear } from "@/lib/format";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { trackEvent } from "@/lib/analytics";
import { useFilmImpression } from "@/hooks/useFilmImpression";
import { getAwardBadge, type AwardBadgeStatus } from "@/components/film-card/award-badge";
import { getListBadge } from "@/components/film-card/list-badge";
import { ImdbIcon } from "@/components/film-card/imdb-icon";
import { TomatoIcon } from "@/components/film-card/tomato-icon";

interface FilmCardProps {
  film: Film;
  className?: string | undefined;
  // Award bodies the badge count is scoped to (from the browse filter). Empty or
  // omitted → count across all bodies.
  awardBodies?: AwardBodyFilter[];
  // Won / nominated / any — mirrors the browse award-status control.
  awardStatus?: AwardBadgeStatus;
}

export function FilmCard({ film, className, awardBodies, awardStatus = "any" }: FilmCardProps) {
  const cardRef = useFilmImpression<HTMLAnchorElement>(film, "shared_film_card");
  const badge = getAwardBadge(film, awardBodies ?? [], awardStatus);
  const listBadge = getListBadge(film);
  const primaryGenre = film.genres[0] ?? film.contentType;

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
      aria-label={`${film.title} (${formatFilmYear(film)})`}
      className={cn("group block w-full min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]", className)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18] group-hover:shadow-[0_26px_60px_rgba(0,0,0,0.48)]">
        {film.posterUrl ? (
          <Image
            src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
            alt={`${film.title} poster`}
            width={342}
            height={513}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            placeholder="blur"
            blurDataURL={blurDataUrl(film.posterColor)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
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
            {badge && (
              <span
                aria-label={badge.detail}
                className="inline-flex max-w-full items-center rounded-full border border-[#2dd4bf]/40 bg-black/75 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5eead4] shadow-lg shadow-black/30 backdrop-blur-sm"
              >
                <span className="shrink-0">{badge.detail}</span>
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center justify-end gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
          {formatFilmYear(film)}
          <span className="text-[#8d879d]"> · {primaryGenre}</span>
        </p>
      </div>
    </Link>
  );
}
