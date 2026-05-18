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
      className={cn("group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]", className)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18] group-hover:shadow-[0_26px_60px_rgba(0,0,0,0.48)]">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#151520,#0b0b12)]">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.32em] text-[#555064]">
              No Poster
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_58%,rgba(0,0,0,0.55)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />

        {/* Award badge — rounded pill, inset from corner */}
        {badge && (
          <div
            aria-label={`${badge.body} ${badge.won ? "winner" : "nominee"}`}
            className="absolute left-2.5 top-2.5"
          >
            {badge.won ? (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.14em] shadow-lg shadow-black/25"
                style={{ backgroundColor: badge.color, color: badge.text }}
              >
                {badge.body}
              </span>
            ) : (
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.14em] shadow-lg shadow-black/25 backdrop-blur-sm"
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
      <div className="pt-3">
        <h3 className="line-clamp-1 text-[13px] font-semibold leading-snug text-[#eeeaf6] transition-colors group-hover:text-white sm:text-[14px]">
          {film.title}
        </h3>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#8f8a9f]">
          {film.year}
          {film.genres.length > 0 && (
            <span className="text-[#5f5a70]"> · {film.genres[0]}</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function FilmCardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("block", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <div className="space-y-2 pt-3">
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
