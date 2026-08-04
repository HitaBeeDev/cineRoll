import { FILM_PATH_PREFIX } from "./film-path-prefix";
import { NEW_TAB_PROPS } from "./new-tab-props";

/**
 * The same props for a link whose destination is only known at runtime — a stats
 * reel row is a film, a person, or an in-page anchor, and only the first of the
 * three is a detour.
 */
export function newTabPropsFor(href: string): Partial<typeof NEW_TAB_PROPS> {
  return href.startsWith(FILM_PATH_PREFIX) ? NEW_TAB_PROPS : {};
}
