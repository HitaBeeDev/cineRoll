import { isSeriesContentType } from "./is-series-content-type";

/**
 * How to introduce the person stored in `director`.
 *
 * A series record holds TMDB's `created_by` there — a /tv response carries no
 * "Director" crew at all (see `buildTvFromTmdb`) — so labelling that name "Dir."
 * asserts a credit the person does not hold. Series say "Created by".
 */
export function formatCreditLabel(film: { contentType?: string | null }): string {
  return isSeriesContentType(film.contentType) ? "Created by" : "Dir.";
}
