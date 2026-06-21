"use client";

import Image from "next/image";
import { CalendarDays, Clock, Globe, Sparkles } from "lucide-react";
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
  backdropUrl,
  posterColor,
  isPickOfDay,
}: FilmDetailHeroProps) {
  const shouldShowOriginalTitle = Boolean(
    originalTitle && originalTitle.trim() !== title.trim(),
  );
  const formattedRuntime = formatRuntime(runtime);
  const accent = posterColor ?? "#D4AF37";

  return (
    <section className="relative flex min-h-[68vh] flex-col overflow-hidden bg-[#09090f] sm:min-h-[74vh]">
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover object-center opacity-58 saturate-[1.18]"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(9,9,15,0.98) 0%, rgba(9,9,15,0.78) 42%, rgba(9,9,15,0.26) 100%),
            linear-gradient(180deg, rgba(9,9,15,0.35) 0%, rgba(9,9,15,0.18) 36%, rgba(9,9,15,0.96) 100%),
            radial-gradient(ellipse 56% 48% at 78% 18%, ${accent}38, transparent 62%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(245,245,240,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,240,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#09090f] to-transparent" />

      <div className="relative z-10 mt-auto w-full">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pb-28 lg:px-8">
          <div className="max-w-4xl">
            {isPickOfDay && (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8453c]/35 bg-[#e8453c]/14 px-3 py-1.5 shadow-[0_0_34px_rgba(232,69,60,0.16)] backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-[#e8453c]" aria-hidden />
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#e8453c]">
                  Pick of the Day
                </span>
              </div>
            )}
            <h1 className="max-w-[12ch] text-balance font-[family-name:var(--font-display)] text-[clamp(4rem,11vw,10rem)] font-bold leading-[0.78] tracking-normal text-[#F5F5F0] drop-shadow-[0_18px_58px_rgba(0,0,0,0.72)]">
              {title}
            </h1>
            {shouldShowOriginalTitle && (
              <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic leading-tight text-[#c8c8d4] sm:text-2xl">
                {originalTitle}
              </p>
            )}
            <div className="mt-7 flex max-w-full flex-wrap items-center gap-2 overflow-hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#a6a6b5]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-md">
                <CalendarDays className="h-3 w-3 text-[#e8453c]" aria-hidden />
                {year}
              </span>
              {formattedRuntime && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-md">
                  <Clock className="h-3 w-3 text-[#e8453c]" aria-hidden />
                  {formattedRuntime}
                </span>
              )}
              {language && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-md">
                  <Globe className="h-3 w-3 text-[#e8453c]" aria-hidden />
                  {language}
                </span>
              )}
              {director && (
                <span className="inline-flex max-w-[calc(100vw-2rem)] basis-full items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-md sm:max-w-full sm:basis-auto">
                  <span className="shrink-0">Dir.</span>
                  <span className="min-w-0 truncate text-[#F5F5F0]">{director}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
