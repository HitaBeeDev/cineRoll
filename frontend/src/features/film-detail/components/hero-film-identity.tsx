import Link from "next/link";
import { Sparkles } from "lucide-react";
import { formatFilmLength, formatLanguage, formatSeriesEpisodes } from "@/lib/format";
import { displayTitle, nameToSlug } from "@/lib/utils";
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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8453c]/40 bg-[#e8453c]/14 px-3.5 py-2 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-[#e8453c]" aria-hidden />
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
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
      {film.director && (
        <Link
          href={`/person/${nameToSlug(film.director)}`}
          className="mt-4 inline-block font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.36em] text-white/75 transition-colors hover:text-white"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
        >
          {film.director}
        </Link>
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
      {film.genres.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {film.genres.slice(0, 3).map((genre) => (
            <HeroGenreTag key={genre} genre={genre} />
          ))}
        </div>
      )}
    </>
  );
}
