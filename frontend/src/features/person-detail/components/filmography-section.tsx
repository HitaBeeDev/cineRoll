import { EditorialSectionLabel } from "@/components/editorial-section-label";
import type { FilmographyProps } from "../component-props";
import { FilmPosterCard } from "./film-poster-card";

export function FilmographySection({ films }: FilmographyProps) {
  if (films.length === 0) return null;

  return (
    <section>
      <EditorialSectionLabel>Filmography</EditorialSectionLabel>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {films.map((film) => (
          <FilmPosterCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  );
}
