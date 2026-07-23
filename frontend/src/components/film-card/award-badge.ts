import type { AwardBodyFilter, Film } from "@cineroll/types";

type AwardBadge = { detail: string } | null;

/** Award status the browse filter can be scoped to. */
export type AwardBadgeStatus = "any" | "won" | "nom";

// Per-body win/nomination field pairs, so the badge can be summed over whichever
// bodies the browse scope currently selects.
const AWARD_BODY_FIELDS: Record<
  AwardBodyFilter,
  { wins: keyof Film; noms: keyof Film }
> = {
  oscar:       { wins: "oscarWins",  noms: "oscarNominations" },
  goldenglobe: { wins: "ggWins",     noms: "ggNominations" },
  cannes:      { wins: "cannesWins", noms: "cannesNominations" },
  berlin:      { wins: "berlinWins", noms: "berlinNominations" },
};

const ALL_AWARD_BODIES: AwardBodyFilter[] = ["oscar", "goldenglobe", "cannes", "berlin"];

/**
 * Award count for the poster badge, scoped to the active browse filter:
 *  - `bodies` empty → sum across every award body (the default "all awards").
 *  - `bodies` non-empty → sum only the selected bodies, so filtering Oscar shows
 *    the film's Oscar count, Cannes shows its Cannes count, etc.
 *  - `status` picks which number: "won" → wins, "nom" → nominations, "any" →
 *    wins when it has any, otherwise nominations.
 * No single body is named on the chip, so the number reads as "N awards" for the
 * current scope rather than being misread as "N Oscars".
 */
export function getAwardBadge(
  film: Film,
  bodies: AwardBodyFilter[],
  status: AwardBadgeStatus,
): AwardBadge {
  const scope = bodies.length > 0 ? bodies : ALL_AWARD_BODIES;
  let wins = 0;
  let noms = 0;
  for (const body of scope) {
    const fields = AWARD_BODY_FIELDS[body];
    wins += film[fields.wins] as number;
    noms += film[fields.noms] as number;
  }

  const winsBadge = wins > 0 ? { detail: `${wins} ${wins === 1 ? "award" : "awards"}` } : null;
  const nomsBadge = noms > 0 ? { detail: `${noms} ${noms === 1 ? "nom" : "noms"}` } : null;

  if (status === "won") return winsBadge;
  if (status === "nom") return nomsBadge;
  return winsBadge ?? nomsBadge;
}
