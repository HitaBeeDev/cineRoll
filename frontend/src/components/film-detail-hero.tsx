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
  posterColor,
  isPickOfDay,
}: FilmDetailHeroProps) {
  const shouldShowOriginalTitle = Boolean(
    originalTitle && originalTitle.trim() !== title.trim(),
  );
  const formattedRuntime = formatRuntime(runtime);
  const accent = posterColor ?? "#D4AF37";

  return (
    <section className="relative flex min-h-[62vh] sm:min-h-[70vh] flex-col overflow-hidden bg-[#09090f]">
      {/* Atmospheric color tint from poster accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 78% 15%, ${accent}28, transparent 58%)`,
        }}
      />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(245,245,240,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,240,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* Content — pushed to the bottom via mt-auto */}
      <div className="relative z-10 mt-auto w-full">
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 lg:px-8">
          <div className="max-w-[22ch]">
            {isPickOfDay && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#e8453c]/28 bg-[#e8453c]/12 px-3 py-1">
                <span className="font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
                  ◈ Pick of the Day
                </span>
              </div>
            )}
            <h1 className="[overflow-wrap:anywhere] font-[family-name:var(--font-display)] text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.9] text-[#F5F5F0]">
              {title}
            </h1>
            {shouldShowOriginalTitle && (
              <p className="mt-3 font-[family-name:var(--font-display)] text-xl italic leading-tight text-[#a6a6b5] sm:text-2xl">
                {originalTitle}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#555568]">
              <span className="text-[#a6a6b5]">{year}</span>
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
      </div>
    </section>
  );
}
