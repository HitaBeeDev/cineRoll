import { Play } from "lucide-react";
import { FilmDetailActions } from "@/components/film-detail-actions";
import { HERO_LABEL_TYPE } from "@/components/film-detail-actions/styles/hero-label-type";
import { cn } from "@/lib/utils/cn";

/**
 * The hero action row: one filled primary, "Watch Trailer", and then circular
 * glyphs for everything else. Two shapes, and the difference between them is
 * the hierarchy — nothing in the row is a bordered rectangle competing with the
 * primary for the same job. Share strings are computed by the page and passed
 * through so this stays presentational.
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
    <div className="flex flex-wrap items-center gap-2.5">
      {trailerUrl && (
        <a
          href="#trailer"
          className={cn(
            HERO_LABEL_TYPE,
            // h-12 rather than vertical padding, so the primary keeps a fixed
            // height a step above the 40px glyphs beside it — that size step is
            // the hierarchy. Full width on a phone, where the primary and the
            // glyph row can't share a line anyway: better a deliberate stack led
            // by the primary than an accidental wrap.
            "flex h-12 w-full items-center justify-center gap-2.5 bg-accent px-7 font-bold tracking-[0.22em] text-white sm:w-auto sm:justify-start shadow-lg shadow-accent/20 transition-all hover:bg-[#d5342b] hover:shadow-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          )}
        >
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
          Watch Trailer
        </a>
      )}
      <FilmDetailActions
        filmId={filmId}
        filmTitle={filmTitle}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
        shareCaption={shareCaption}
      />
    </div>
  );
}
