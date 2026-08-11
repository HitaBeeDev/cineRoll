import Image from "next/image";
import { FilmLink } from "@/components/film-link";
import { blurDataUrl } from "@/lib/images/blur-data-url";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
import { TileMetaLine } from "@/components/film-tile/tile-meta-line";
import { awardSummary } from "@/components/list-detail-grid/award-summary";
import type { SavedFilm } from "@/types/saved-film";

/**
 * A film in an announcement's group page. The same poster treatment as the list
 * and watchlist cards, minus the remove control — nothing here is the user's to
 * edit; it is a record of what the catalogue gained.
 */
export function NotificationFilmCard({ film }: { film: SavedFilm }) {
  const summary = awardSummary(film);

  return (
    <div className="group relative min-w-0">
      <FilmLink
        slug={film.slug}
        aria-label={`${film.title}${film.year ? ` (${film.year})` : ""}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18]">
          {film.posterUrl ? (
            <Image
              src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
              alt={`${film.title} poster`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              placeholder="blur"
              blurDataURL={blurDataUrl(null)}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#151520,#0b0b12)]">
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#555064]">
                No Poster
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
        </div>
      </FilmLink>

      <div className="pt-3">
        <h3 className="line-clamp-1 text-[14px] font-semibold leading-snug text-[#eeeaf6] sm:text-[15px]">
          {film.title}
        </h3>
        <TileMetaLine film={film} />
        {summary ? (
          <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]">
            {summary}
          </p>
        ) : null}
      </div>
    </div>
  );
}
