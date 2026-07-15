import { buildFilmJsonLd } from "../build-film-json-ld";
import type { FilmProps } from "../component-props";

export function FilmStructuredData({ film }: FilmProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFilmJsonLd(film)) }}
    />
  );
}
