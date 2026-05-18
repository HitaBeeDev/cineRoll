import Link from "next/link";
import Image from "next/image";
import { Star, Trophy } from "lucide-react";
import type { Film } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type AwardBadge = { label: "Won" | "Nominated"; body: string } | null;

function getAwardBadge(film: Film): AwardBadge {
  if (film.oscarWins > 0)         return { label: "Won",       body: "Oscar"        };
  if (film.ggWins > 0)            return { label: "Won",       body: "Golden Globe" };
  if (film.cannesWins > 0)        return { label: "Won",       body: "Cannes"       };
  if (film.oscarNominations > 0)  return { label: "Nominated", body: "Oscar"        };
  if (film.ggNominations > 0)     return { label: "Nominated", body: "Golden Globe" };
  if (film.cannesNominations > 0) return { label: "Nominated", body: "Cannes"       };
  return null;
}

interface FilmCardProps {
  film: Film;
  className?: string | undefined;
}

export function FilmCard({ film, className }: FilmCardProps) {
  const badge = getAwardBadge(film);
  const isWin = badge?.label === "Won";

  return (
    <Link
      href={`/film/${film.slug}`}
      aria-label={`${film.title} (${film.year})`}
      className={cn("group block outline-none", className)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0d18]">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#252538]">
              No Poster
            </span>
          </div>
        )}

        {/* Red hover glow overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px rgba(232,69,60,0.4)" }}
        />

        {/* Award badge — sharp edge, top-left */}
        {badge && (
          <div
            aria-label={`${badge.body} ${badge.label}`}
            className={cn(
              "absolute left-0 top-2.5 flex items-center gap-1 pl-2 pr-2.5 py-0.5",
              "font-[family-name:var(--font-geist-mono)] text-[7px] font-semibold uppercase tracking-[0.2em]",
              isWin
                ? "bg-[#D4AF37] text-[#09090f]"
                : "bg-black/85 text-[#D4AF37] border-r border-t border-b border-[#D4AF37]/30 backdrop-blur-sm",
            )}
          >
            <Trophy className="h-2 w-2 shrink-0" aria-hidden />
            {isWin ? badge.body : "Nom."}
          </div>
        )}

        {/* IMDb score — bottom right, appears on hover */}
        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Star className="h-2.5 w-2.5 fill-[#D4AF37] text-[#D4AF37]" aria-hidden />
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-semibold tabular-nums text-[#D4AF37]">
              {film.imdbRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info strip — always visible, below poster */}
      <div className="pt-2.5">
        <h3 className="line-clamp-1 font-[family-name:var(--font-display)] text-[13px] font-semibold leading-snug text-[#d8d8f0] transition-colors group-hover:text-white group-focus-visible:text-white">
          {film.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#454560]">
            {film.year}
          </span>
          {film.genres.length > 0 && (
            <>
              <span className="text-[9px] text-[#252535]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#383855] line-clamp-1">
                {film.genres[0]}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FilmCardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("block", className)}>
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="pt-2.5 space-y-1.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}
