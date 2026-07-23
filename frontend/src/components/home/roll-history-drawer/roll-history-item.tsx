import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { RollFilm } from "@/lib/api";
import { formatFilmMeta } from "@/components/home/roll-history-drawer/format-film-meta";

/** One clickable history row: order index, poster, title/meta, and affordance.
 *  Records a film-click event and closes the drawer on navigation. */
export function RollHistoryItem({
  film,
  index,
  onNavigate,
}: {
  film: RollFilm;
  index: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/film/${film.slug}`}
      onClick={() => {
        trackEvent({
          type: "film_click",
          filmId: film.id,
          context: { source: "roll_history", slug: film.slug },
        });
        onNavigate();
      }}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
        "border border-[#17171f] bg-[#0a0a14]",
        "transition-all duration-200",
        "hover:border-[#e8453c]/35 hover:bg-[#0e0e1a]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c] focus-visible:ring-inset",
      )}
    >
      {/* Roll index — chronological, so the number carries real order */}
      <span className="w-5 shrink-0 text-center font-[family-name:var(--font-geist-mono)] text-[11px] font-bold tabular-nums text-[#3c3c54] transition-colors group-hover:text-[#e8453c]/75">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Poster */}
      <div className="relative h-[56px] w-[38px] shrink-0 overflow-hidden rounded">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt=""
            fill
            sizes="38px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1c]">
            <Film className="h-3.5 w-3.5 text-[#2a2a3e]" aria-hidden />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-[family-name:var(--font-display)] text-[1.02rem] font-bold leading-tight text-[#F5F5F0] transition-colors group-hover:text-white">
          {film.title}
        </p>
        <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#7a7a90]">
          {formatFilmMeta(film)}
        </p>
      </div>

      {/* Click affordance */}
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-[#2a2a3e] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8453c]"
        aria-hidden
      />
    </Link>
  );
}
