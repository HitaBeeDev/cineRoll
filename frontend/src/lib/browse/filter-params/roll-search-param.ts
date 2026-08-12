/**
 * The one browse query param that is not a filter: the slug of the rolled film
 * on show.
 *
 * It lives beside the filter params because the filter serializer rebuilds the
 * query from scratch on every edit — that is how clearing a filter works — so
 * anything it does not own is dropped unless it is carried over by name.
 */
export const ROLL_SEARCH_PARAM = "roll";
