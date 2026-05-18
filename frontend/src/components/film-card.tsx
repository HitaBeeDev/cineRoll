import Link from "next/link";
import Image from "next/image";
import type { Film } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type AwardBadge = {
  body: string;
  won: boolean;
  color: string;   // bg color for wins
  text: string;    // text color for wins
} | null;

function getAwardBadge(film: Film): AwardBadge {
  if (film.oscarWins > 0)
    return { body: "Oscar", won: true,  color: "#e8453c", text: "#ffffff" };
  if (film.ggWins > 0)
    return { body: "Golden Globe", won: true,  color: "#D4AF37", text: "#09090f" };
  if (film.cannesWins > 0)
    return { body: "Cannes", won: true,  color: "#c0a030", text: "#09090f" };
  if (film.oscarNominations > 0)
    return { body: "Oscar", won: false, color: "#e8453c", text: "#ffffff" };
  if (film.ggNominations > 0)
    return { body: "Golden Globe", won: false, color: "#D4AF37", text: "#09090f" };
  if (film.cannesNominations > 0)
    return { body: "Cannes", won: false, color: "#c0a030", text: "#09090f" };
  return null;
}

interface FilmCardProps {
  film: Film;
  className?: string | undefined;
}

export function FilmCard({ film, className }: FilmCardProps) {
  const badge = getAwardBadge(film);

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
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#252538]">
              No Poster
            </span>
          </div>
        )}

        {/* Award badge — rounded pill, inset from corner */}
        {badge && (
          <div
            aria-label={`${badge.body} ${badge.won ? "winner" : "nominee"}`}
            className="absolute left-2 top-2"
          >
            {badge.won ? (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.15em]"
                style={{ backgroundColor: badge.color, color: badge.text }}
              >
                {badge.body}
              </span>
            ) : (
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm"
                style={{
                  borderColor: `${badge.color}60`,
                  color: badge.color,
                  backgroundColor: "rgba(0,0,0,0.65)",
                }}
              >
                {badge.body}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info below poster — always visible */}
      <div className="pt-2">
        <h3 className="line-clamp-1 text-[13px] font-semibold leading-snug text-[#e8e8f8] transition-colors group-hover:text-white">
          {film.title}
        </h3>
        <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#8080a0]">
          {film.year}
          {film.genres.length > 0 && (
            <span className="text-[#505068]"> · {film.genres[0]}</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function FilmCardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("block", className)}>
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="space-y-1.5 pt-2">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}
