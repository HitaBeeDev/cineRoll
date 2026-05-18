import Link from "next/link";
import Image from "next/image";
import { Star, Trophy } from "lucide-react";
import type { Film } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function getHighestAward(film: Film): { label: "Won" | "Nominated"; body: string } | null {
  if (film.oscarWins > 0)        return { label: "Won",       body: "Oscar" };
  if (film.ggWins > 0)           return { label: "Won",       body: "Golden Globe" };
  if (film.cannesWins > 0)       return { label: "Won",       body: "Cannes" };
  if (film.oscarNominations > 0) return { label: "Nominated", body: "Oscar" };
  if (film.ggNominations > 0)    return { label: "Nominated", body: "Golden Globe" };
  if (film.cannesNominations > 0)return { label: "Nominated", body: "Cannes" };
  return null;
}


interface FilmCardProps {
  film: Film;
  className?: string;
}

export function FilmCard({ film, className }: FilmCardProps) {
  const award = getHighestAward(film);
  const isWinner = award?.label === "Won";

  return (
    <Link
      href={`/film/${film.slug}`}
      aria-label={`${film.title} (${film.year})`}
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "border border-[#161624] bg-[#0b0b14]",
        "transition-all duration-200 ease-out",
        "hover:border-[#e8453c]/30 hover:shadow-[0_0_0_1px_rgba(232,69,60,0.15),0_8px_32px_rgba(0,0,0,0.7)]",
        "outline-none focus-visible:border-[#e8453c]/50 focus-visible:shadow-[0_0_0_1px_rgba(232,69,60,0.25)]",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0d18]">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#303048]">
              No Poster
            </span>
          </div>
        )}

        {/* Persistent bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Award badge — top left */}
        {award && (
          <div
            aria-label={`${award.body} ${award.label}`}
            className={cn(
              "absolute left-0 top-3 flex items-center gap-1.5 pl-2.5 pr-2.5 py-1",
              "font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em]",
              isWinner
                ? "bg-[#D4AF37] text-[#09090f]"
                : "bg-black/80 text-[#D4AF37]/80 backdrop-blur-sm border-r border-t border-b border-[#D4AF37]/25",
            )}
          >
            <Trophy className="h-2.5 w-2.5 shrink-0" aria-hidden />
            {isWinner ? award.body : `Nom.`}
          </div>
        )}

        {/* Rating — bottom right on hover */}
        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" aria-hidden />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold text-[#D4AF37]">
              {film.imdbRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info strip — always visible */}
      <div className="flex flex-col gap-0.5 px-2.5 py-2 border-t border-[#161624]">
        <h3 className="font-[family-name:var(--font-display)] line-clamp-1 text-[13px] font-semibold leading-snug text-[#e8e8f0] group-hover:text-white transition-colors">
          {film.title}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#505068]">
            {film.year}
          </span>
          {film.genres.length > 0 && (
            <>
              <span className="text-[#252538] text-[9px]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#404058] line-clamp-1">
                {film.genres[0]}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FilmCardSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "aspect-[2/3] rounded-xl border border-transparent",
        "shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
        className,
      )}
    />
  );
}
