import { FILM_PATH_PREFIX } from "./film-path-prefix";

/**
 * `hash` targets a section of the detail page (`awards`, say) — for links that
 * promise something more specific than "the film", and should land on it rather
 * than at the top of the page with the reader left to find it.
 */
export function filmHref(slug: string, hash?: string): string {
  return `${FILM_PATH_PREFIX}${slug}${hash ? `#${hash}` : ""}`;
}
