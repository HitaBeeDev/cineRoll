import Image from "next/image";
import type { MouseEvent } from "react";
import { FilmLink } from "@/components/film-link";
import type { RollFilm } from "@/lib/api";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatGenres } from "@/lib/format/format-genres";
import { getFilmAwards } from "../get-film-awards";
import { trackNaturalRollClick } from "@/features/describe/natural-roll-analytics/track-natural-roll-click";
import { FilmAwardBadges } from "./film-award-badges";

type FilmCardProps = {
  film: RollFilm;
  shouldPreventNavigation?: () => boolean;
};

export function FilmCard({ film, shouldPreventNavigation }: FilmCardProps) {
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const typeAndGenres = [formatContentType(film), formatGenres(film)].filter(Boolean).join(" · ");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (shouldPreventNavigation?.()) {
      event.preventDefault();
      return;
    }
    trackNaturalRollClick(film);
  }

  return (
    <FilmLink
      slug={film.slug}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onClick={handleClick}
      className="group relative flex h-full min-h-[260px] overflow-hidden rounded-lg border border-edge bg-ink-900/70 transition-colors hover:border-accent/40 sm:min-h-0"
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-ink-900" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/58 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900/30 to-transparent" />
      {/* The text sits on the poster, and a poster carries its own printed title
          in roughly this band — two titles in two fonts on top of each other
          (Tokyo Sonata, Fleabag). The card-wide wash above is not enough to
          settle that, so the block carries its own scrim: solid behind every
          line, fading out across the 44px lead-in above the title. Anchored to
          the block rather than to a share of the card, so it still covers the
          text on a short card (the 260px mobile minimum) and doesn't swallow
          half the poster on a tall one. */}
      {/* w-full because the card is a flex ROW and this is its only item: left
          to size itself the block is only as wide as its longest line, and the
          scrim would end mid-poster (visible on a short title like This Is Us). */}
      <div className="relative z-10 mt-auto flex w-full min-w-0 flex-col gap-2 bg-[linear-gradient(to_top,#09090f_calc(100%_-_44px),transparent)] px-3 pb-3 pt-11 sm:px-4 sm:pb-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-fg-hi">
          {film.title}
        </h3>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-4 tracking-widest text-[#b6b6c6]">
          {film.year}{film.director ? ` · ${film.director}` : ""}
        </p>
        {/* Type and genres read as one quiet line here, not as chips — this card
            is a fifth of a row wide, and a chip per genre would stack three deep
            over the poster. */}
        {typeAndGenres && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-4 tracking-widest text-[#8f8fa2]">
            {typeAndGenres}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {film.imdbRating != null && (
            <span className="rounded-full border border-accent/35 bg-ink-900/70 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-accent">
              IMDb {film.imdbRating.toFixed(1)}
            </span>
          )}
        </div>
        <FilmAwardBadges awards={getFilmAwards(film)} />
      </div>
    </FilmLink>
  );
}
