import type { AwardRecord } from "@cineroll/types";
import { formatPersonName } from "@/lib/format/format-person-name";

/**
 * The person the award line is about, or null when the record names the film.
 *
 * Award data records a nominee for every row, but only some of them add
 * anything: "Best Actress · Kirstie Alley" is the whole point of the line,
 * while "Best Television Series · Cheers" repeats the title at the top of the
 * page once per row. Matching is loose because the two strings come from
 * different sources — an award ceremony's spelling of a title and TMDB's.
 */
export function getAwardRecipient(record: AwardRecord, filmTitle: string): string | null {
  const nominee = record.nominee?.trim();
  if (!nominee) return null;

  return normalize(nominee) === normalize(filmTitle) ? null : formatPersonName(nominee);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
