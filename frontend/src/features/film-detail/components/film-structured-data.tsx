import { JsonLd } from "@/components/json-ld";
import { buildFilmJsonLd } from "@/lib/seo/build-film-json-ld";
import type { FilmProps } from "../component-props";

export function FilmStructuredData({ film }: FilmProps) {
  return <JsonLd data={buildFilmJsonLd(film)} />;
}
