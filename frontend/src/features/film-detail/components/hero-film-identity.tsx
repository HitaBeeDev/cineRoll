import Link from "next/link";
import { Sparkles } from "lucide-react";
import { contentTypeFilterValue } from "@/lib/format/content-type-filter-value";
import { filmGenreList } from "@/lib/format/film-genre-list";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatFilmLength } from "@/lib/format/format-film-length";
import { formatLanguage } from "@/lib/format/format-language";
import { formatSeriesEpisodes } from "@/lib/format/format-series-episodes";
import { isSeriesContentType } from "@/lib/format/is-series-content-type";
import { displayTitle } from "@/lib/utils/display-title";
import { nameToSlug } from "@/lib/utils/name-to-slug";
import { getTitleFontSize } from "../title-font-size";
import { HeroGenreTag } from "./hero-genre-tag";
import { HeroMetaLine } from "./hero-meta-line";
import type { FilmAccentProps } from "../component-props";

export function HeroFilmIdentity({
  film,
  accent,
}: FilmAccentProps) {
  const title = displayTitle(film.title);

  return (
    <>
      {film.isPickOfDay && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/14 px-3.5 py-2 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-accent" aria-hidden />
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            Pick of the Day
          </span>
        </div>
      )}
      <h1
        className="font-[family-name:var(--font-display)] font-bold leading-[0.87] tracking-tight text-[#F8F8F4]"
        style={{
          fontSize: getTitleFontSize(title),
          textShadow: "0 2px 40px rgba(0,0,0,0.6)",
        }}
      >
        {title}
      </h1>
      {/* A bare name under a title reads as "directed by" — true for a movie,
          false for a series, whose credit is TMDB's created_by. Series say so;
          movies keep the unlabelled line they always had. */}
      {film.director && (
        <p
          className="mt-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.36em] text-white/75"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
        >
          {isSeriesContentType(film.contentType) && (
            <span className="text-white/45">Created by </span>
          )}
          <Link
            href={`/person/${nameToSlug(film.director)}`}
            className="transition-colors hover:text-white"
          >
            {film.director}
          </Link>
        </p>
      )}
      {film.originalTitle && film.originalTitle !== film.title && (
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl italic text-white/55">
          {film.originalTitle}
        </p>
      )}
      <HeroMetaLine
        film={film}
        accent={accent}
        runtime={[formatFilmLength(film), formatSeriesEpisodes(film)]
          .filter(Boolean)
          .join(" · ")}
        language={formatLanguage(film.language)}
      />
      {/* Type first, then every genre — not a top-3 slice, since the tags wrap
          and there is no reason to hide two thirds of what a title actually is. */}
      {(formatContentType(film) || filmGenreList(film).length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* The type sits in a row of genre links, so it filters browse too —
              an identical-looking chip that ignores clicks reads as broken. */}
          {formatContentType(film) && contentTypeFilterValue(film) && (
            <Link
              href={`/browse?contentType=${encodeURIComponent(contentTypeFilterValue(film))}`}
              className="inline-flex items-center rounded-[3px] border border-white/30 bg-white/[0.08] px-2.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition-colors hover:border-accent/45 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {formatContentType(film)}
            </Link>
          )}
          {filmGenreList(film).map((genre) => (
            <HeroGenreTag key={genre} genre={genre} />
          ))}
        </div>
      )}
    </>
  );
}
