"use client";

import { Clock, Globe } from "lucide-react";
import { formatRuntime } from "@/lib/format";

type FilmDetailHeroProps = {
  title: string;
  originalTitle: string | null;
  year: number;
  runtime: number | null;
  language: string | null;
  director: string | null;
  backdropUrl?: string | null;
  posterColor?: string | null;
  isPickOfDay: boolean;
};

export function FilmDetailHero({
  title,
  originalTitle,
  year,
  runtime,
  language,
  director,
  isPickOfDay,
}: FilmDetailHeroProps) {
  const shouldShowOriginalTitle = Boolean(
    originalTitle && originalTitle.trim() !== title.trim(),
  );
  const formattedRuntime = formatRuntime(runtime);

  return (
    <section className="flex bg-[#09090f]">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {isPickOfDay && (
            <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
              Pick of the Day
            </p>
          )}
          <h1 className="max-w-[16ch] [overflow-wrap:anywhere] font-[family-name:var(--font-display)] text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.92] text-[#F5F5F0]">
            {title}
          </h1>
          {shouldShowOriginalTitle && (
            <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic leading-tight text-[#888899] sm:text-2xl">
              {originalTitle}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#555568]">
            <span>{year}</span>
            {formattedRuntime && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {formattedRuntime}
                </span>
              </>
            )}
            {language && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" aria-hidden />
                  {language}
                </span>
              </>
            )}
            {director && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Dir.{" "}
                  <span className="text-[#888899]">{director}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
