import { Play } from "lucide-react";
import { FilmDetailActions } from "@/components/film-detail-actions";
import { ShareButton } from "@/components/share-button";

/**
 * The hero action row: primary "Watch Trailer", secondary Watchlist, and the
 * quiet icon cluster (Watched / Not Interested / Share). Share strings are
 * computed by the page and passed in so this stays presentational.
 */
export function HeroCTAs({
  trailerUrl,
  filmId,
  filmTitle,
  shareUrl,
  shareTitle,
  shareCaption,
}: {
  trailerUrl: string | null;
  filmId: string;
  filmTitle: string;
  shareUrl: string;
  shareTitle: string;
  shareCaption: string;
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-3">
      {trailerUrl && (
        <a
          href="#trailer"
          className="flex items-center gap-2.5 bg-[#e8453c] px-7 py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-lg shadow-[#e8453c]/20 transition-all hover:bg-[#d5342b] hover:shadow-[#e8453c]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
          Watch Trailer
        </a>
      )}
      <FilmDetailActions filmId={filmId} filmTitle={filmTitle} />
      <ShareButton
        url={shareUrl}
        title={shareTitle}
        caption={shareCaption}
        label=""
        ariaLabel="Share this film"
        iconClassName="h-4 w-4"
        className="flex h-12 w-12 items-center justify-center border border-white/10 bg-transparent text-white/45 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
      />
    </div>
  );
}
