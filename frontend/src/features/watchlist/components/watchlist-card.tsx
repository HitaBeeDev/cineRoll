import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { WatchlistCardProps } from "../component-props";
import { getAwardSummary } from "../get-award-summary";

export function WatchlistCard({
  entry,
  isRemoving,
  onRemove,
}: WatchlistCardProps) {
  const { film } = entry;
  const awardSummary = getAwardSummary(film);
  const primaryGenre = film.genres[0] ?? film.contentType;

  return (
    <div className="group relative min-w-0">
      <Link
        href={`/film/${film.slug}`}
        aria-label={`${film.title}${film.year ? ` (${film.year})` : ""}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#11111a] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.18]">
          {film.posterUrl ? (
            <Image
              src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
              alt={`${film.title} poster`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              placeholder="blur"
              blurDataURL={blurDataUrl(null)}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#151520,#0b0b12)]">
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#555064]">No Poster</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Remove ${film.title} from watchlist`}
        disabled={isRemoving}
        onClick={() => onRemove(film)}
        className={cn(
          "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
          "border border-white/15 bg-black/65 text-white/70 backdrop-blur-md",
          "transition-colors hover:border-[#e8453c]/60 hover:text-[#e8453c]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
      <div className="pt-3">
        <h3 className="line-clamp-1 text-[14px] font-semibold leading-snug text-[#eeeaf6] sm:text-[15px]">{film.title}</h3>
        <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#9d98ad]">
          {film.year ?? "—"}
          {primaryGenre && <span className="text-[#6f6a80]"> · {primaryGenre}</span>}
        </p>
        {awardSummary && (
          <p className="mt-1 line-clamp-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]">
            {awardSummary}
          </p>
        )}
      </div>
    </div>
  );
}
