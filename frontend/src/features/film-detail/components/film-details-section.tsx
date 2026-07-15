import { ExternalLink } from "lucide-react";
import type { FilmDetailsSectionProps } from "../component-props";
import { MetaHeading } from "./meta-heading";
import { SectionLabel } from "./section-label";

export function FilmDetailsSection({
  film,
  rankTags,
}: FilmDetailsSectionProps) {
  if (film.genres.length === 0 && rankTags.length === 0 && !film.imdbId) {
    return null;
  }

  return (
    <section id="details">
      <SectionLabel>Details</SectionLabel>
      <div className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
        {film.genres.length > 0 && (
          <div>
            <MetaHeading>Genres</MetaHeading>
            <div className="mt-4 flex flex-wrap gap-2">
              {film.genres.map((genre) => (
                <span
                  key={genre}
                  className="border border-[#25253a] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#8888a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#d0d0e8]"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        {rankTags.length > 0 && (
          <div>
            <MetaHeading>Rankings</MetaHeading>
            <div className="mt-4 flex flex-col gap-2">
              {rankTags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#25253a] bg-[#0d0d18] px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#9898b8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {film.imdbId && (
          <div>
            <MetaHeading>Links</MetaHeading>
            <div className="mt-4">
              <a
                href={`https://www.imdb.com/title/${film.imdbId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-8 border border-[#25253a] bg-[#0d0d18] px-5 py-4 transition-colors hover:border-[#e8453c]/40"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#9898b8] transition-colors group-hover:text-[#f4f4f5]">
                  IMDb
                </span>
                <ExternalLink
                  className="h-3.5 w-3.5 text-[#555570] transition-colors group-hover:text-[#e8453c]"
                  aria-hidden
                />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
