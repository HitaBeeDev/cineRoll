import { FilmTrailer } from "@/components/film-trailer";
import { EditorialSectionLabel } from "@/components/editorial-section-label";
import { extractYouTubeId } from "../youtube-id";
import type { FilmProps } from "../component-props";

export function TrailerSection({ film }: FilmProps) {
  // A section with nothing in it should not exist — no placeholder void.
  if (!film.trailerUrl) return null;

  return (
    <section id="trailer" className="scroll-mt-24">
      <EditorialSectionLabel>Trailer</EditorialSectionLabel>
      <div className="mt-8">
        <FilmTrailer
          title={film.title}
          trailerUrl={film.trailerUrl}
          youtubeId={extractYouTubeId(film.trailerUrl)}
          thumbnailUrl={film.backdropUrl ?? film.posterUrl}
        />
      </div>
    </section>
  );
}
