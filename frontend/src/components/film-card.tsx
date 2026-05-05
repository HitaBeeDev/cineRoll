import Link from "next/link";
import Image from "next/image";
import { Star, Trophy } from "lucide-react";
import type { Film } from "@cineroll/types";
import { cn } from "@/lib/utils";

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
        "aspect-[2/3] border border-zinc-800 bg-zinc-900",
        "transition-all duration-200 ease-out",
        "hover:border-zinc-600 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        className
      )}
    >
      {film.posterUrl ? (
        <Image
          src={film.posterUrl}
          alt={`${film.title} poster`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-zinc-600">No poster</span>
        </div>
      )}

      {film.oscarWins > 0 && (
        <div
          aria-label={`${film.oscarWins} Oscar ${film.oscarWins === 1 ? "win" : "wins"}`}
          className={cn(
            "absolute right-2 top-2 flex items-center gap-1",
            "rounded-full border border-amber-400/30 bg-black/60 px-2 py-0.5",
            "backdrop-blur-sm"
          )}
        >
          <Trophy className="h-3 w-3 text-amber-400" />
          <span className="text-xs font-semibold tabular-nums text-amber-400">
            {film.oscarWins}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        {film.imdbRating != null && (
          <div className="mb-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="tabular-nums text-xs font-semibold text-amber-400">
              {film.imdbRating.toFixed(1)}
            </span>
          </div>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-100">
          {film.title}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400">{film.year}</p>
        {(() => {
          const summary = buildAwardSummary(film);
          return summary ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{summary}</p>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
