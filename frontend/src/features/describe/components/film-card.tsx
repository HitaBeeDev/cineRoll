import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { RollFilm } from "@/lib/api";
import { getFilmAwards } from "../get-film-awards";
import { trackNaturalRollClick } from "../natural-roll-analytics";
import { FilmAwardBadges } from "./film-award-badges";

type FilmCardProps = {
  film: RollFilm;
  shouldPreventNavigation?: () => boolean;
};

export function FilmCard({ film, shouldPreventNavigation }: FilmCardProps) {
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const genre = film.genres[0];

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (shouldPreventNavigation?.()) {
      event.preventDefault();
      return;
    }
    trackNaturalRollClick(film);
  }

  return (
    <Link
      href={`/film/${film.slug}`}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onClick={handleClick}
      className="group relative flex h-full min-h-[260px] overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#09090f]/70 transition-colors hover:border-[#e8453c]/40 sm:min-h-0"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${film.title} poster`}
          fill
          draggable={false}
          sizes="(min-width: 1024px) 20vw, 50vw"
          className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/58 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090f]/30 to-transparent" />
      <div className="relative z-10 mt-auto flex min-w-0 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0]">
          {film.title}
        </h3>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-4 tracking-widest text-[#b6b6c6]">
          {film.year}{film.director ? ` · ${film.director}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {genre && (
            <span className="rounded-full border border-[#F5F5F0]/20 bg-[#09090f]/70 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#F5F5F0]">
              {genre}
            </span>
          )}
          {film.imdbRating != null && (
            <span className="rounded-full border border-[#e8453c]/35 bg-[#09090f]/70 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#e8453c]">
              IMDb {film.imdbRating.toFixed(1)}
            </span>
          )}
        </div>
        <FilmAwardBadges awards={getFilmAwards(film)} />
      </div>
    </Link>
  );
}
