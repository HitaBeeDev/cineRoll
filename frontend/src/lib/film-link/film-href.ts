import { FILM_PATH_PREFIX } from "./film-path-prefix";

export function filmHref(slug: string): string {
  return `${FILM_PATH_PREFIX}${slug}`;
}
