/**
 * Where a film detail page lives, and how it opens.
 *
 * Every film link in the app opens in its own tab. Browsing this catalogue is a
 * scanning activity — a filtered set, a stats leaderboard, a person's filmography
 * — and opening a title is a detour from it, not a destination. Same-tab
 * navigation makes the detour cost the position in the list; a new tab keeps the
 * set on screen behind it.
 *
 * The rule only holds if it is one rule. Spread across the seventeen places that
 * link to a film it would survive exactly until the eighteenth, so the href and
 * the target are built here and consumed through `<FilmLink>` (or, where the
 * href arrives as data, `newTabPropsFor`).
 */
export const FILM_PATH_PREFIX = "/film/";
