import { FilmTrailer } from "@/components/film-trailer";
import { extractYouTubeId } from "../youtube-id";
import type { FilmProps } from "../component-props";
import { SectionLabel } from "./section-label";

export function TrailerSection({ film }: FilmProps) {
  return (
    <section id="trailer" className="scroll-mt-24">
      <SectionLabel>Trailer</SectionLabel>
      {film.trailerUrl ? (
        <div className="mt-8">
          <FilmTrailer
            title={film.title}
            trailerUrl={film.trailerUrl}
            youtubeId={extractYouTubeId(film.trailerUrl)}
            thumbnailUrl={film.backdropUrl ?? film.posterUrl}
          />
        </div>
      ) : (
        <div className="mt-8 flex aspect-video w-full items-center justify-center border border-[#111118] bg-[#07070c]">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#555570]">
            No trailer available
          </p>
        </div>
      )}
    </section>
  );
}
