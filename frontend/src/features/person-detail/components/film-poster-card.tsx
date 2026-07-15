import Image from "next/image";
import Link from "next/link";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { getNameInitials } from "@/lib/name-avatar";
import type { FilmPosterCardProps } from "../component-props";

export function FilmPosterCard({ film }: FilmPosterCardProps) {
  return (
    <Link
      href={`/film/${film.slug}`}
      className="group relative flex flex-col overflow-hidden border border-[#1e1e30] bg-[#0d0d18] transition-all duration-300 hover:border-[#e8453c]/30 hover:shadow-lg hover:shadow-[#e8453c]/5"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {film.posterUrl ? (
          <Image
            src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            placeholder="blur"
            blurDataURL={blurDataUrl(null)}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0a0a14]">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/12">
              {getNameInitials(film.title)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/20 to-transparent" />
        <div className="absolute left-2 top-2">
          <span
            className={`px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] ${
              film.role === "director"
                ? "bg-[#e8453c]/80 text-white"
                : "bg-black/60 text-white/50"
            }`}
          >
            {film.role}
          </span>
        </div>
        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/70 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#c8a048] backdrop-blur-sm">
              {film.imdbRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="px-2.5 pb-3.5 pt-2">
        <p className="line-clamp-2 text-[0.75rem] font-semibold leading-[1.35] text-[#d4d4e8] transition-colors group-hover:text-white">
          {film.title}
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#444460]">
          {film.releaseYear}
        </p>
      </div>
    </Link>
  );
}
