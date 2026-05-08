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

function buildAwardSummary(film: Film): string | null {
  const parts: string[] = [];
  if (film.oscarWins > 0) {
    parts.push(`${film.oscarWins} Oscar ${film.oscarWins === 1 ? "win" : "wins"}`);
  } else if (film.oscarNominations > 0) {
    parts.push(`${film.oscarNominations} Oscar ${film.oscarNominations === 1 ? "nom" : "noms"}`);
  }
  if (film.ggWins > 0) {
    parts.push(`${film.ggWins} Golden Globe ${film.ggWins === 1 ? "win" : "wins"}`);
  } else if (film.ggNominations > 0) {
    parts.push(`${film.ggNominations} Golden Globe ${film.ggNominations === 1 ? "nom" : "noms"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

interface FilmCardProps {
  film: Film;
  className?: string;
}

export function FilmCard({ film, className }: FilmCardProps) {
  return (
    <Link
      href={`/film/${film.slug}`}
      aria-label={`${film.title} (${film.year})`}
      className={cn(
        "group relative block overflow-hidden rounded-xl",
        "aspect-[2/3] border border-transparent bg-[#111118]",
        "shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)]",
        "hover:border-[#D4AF37]/60",
        "outline-none focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-[#D4AF37] focus-visible:outline-offset-[3px]",
        "focus-visible:border-[#D4AF37]/60 focus-visible:shadow-[0_8px_32px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {film.posterUrl ? (
        <Image
          src={film.posterUrl}
          alt={`${film.title} poster`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-[#5a5a70]">No poster</span>
        </div>
      )}

      {(() => {
        const award = getHighestAward(film);
        if (!award) return null;
        return (
          <div
            aria-label={`${award.body} ${award.label}`}
            className={cn(
              "absolute left-2 top-2 flex items-center gap-1",
              "rounded-full px-2 py-0.5 backdrop-blur-sm",
              award.label === "Won"
                ? "bg-[#D4AF37] text-[#09090f]"
                : "border border-[#D4AF37]/60 bg-black/70 text-[#D4AF37]",
            )}
          >
            <Trophy className="h-3 w-3 shrink-0" aria-hidden />
            <span className="text-xs font-semibold">{award.label}</span>
          </div>
        );
      })()}

      {/* Hover overlay — slides up from below the card bottom */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0",
          "translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0",
          "transition-transform duration-300 ease-out",
          "bg-gradient-to-t from-black/95 via-black/80 to-transparent",
          "pt-14 pb-3 px-3 flex flex-col gap-1",
        )}
      >
        <h3 className="font-[family-name:var(--font-display)] line-clamp-2 text-sm font-bold leading-tight text-[#F5F5F0]">
          {film.title}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A0A0B0]">{film.year}</span>
          {film.imdbRating != null && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-[#D4AF37]">
              <Star className="h-3 w-3 fill-[#D4AF37]" aria-hidden />
              {film.imdbRating.toFixed(1)}
            </span>
          )}
        </div>

        {(() => {
          const summary = buildAwardSummary(film);
          return summary ? (
            <p className="line-clamp-1 text-xs text-[#D4AF37]">{summary}</p>
          ) : null;
        })()}

        <span
          className={cn(
            "mt-1.5 inline-flex w-fit items-center gap-1 rounded-lg",
            "border border-[#F5F5F0]/25 px-2.5 py-1",
            "text-xs font-medium text-[#F5F5F0]/80",
          )}
        >
          Roll Similar →
        </span>
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
