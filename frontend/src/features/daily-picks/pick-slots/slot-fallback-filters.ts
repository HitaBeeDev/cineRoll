import type { FilterState } from "@cineroll/types";
import type { PickSlotNumber } from "../domain-types";

export const SLOT_FALLBACK_FILTERS: Record<
  PickSlotNumber,
  Partial<FilterState>[]
> = {
  "01": [
    { awardBodies: ["oscar"], winnerOnly: true },
    { awardBodies: ["oscar"] },
    {},
  ],
  "02": [
    { awardBodies: ["cannes"] },
    { awardBodies: ["cannes", "berlin"] },
    {},
  ],
  "03": [
    { imdbRatingMin: 7, imdbTopExclude: true },
    { imdbRatingMin: 7 },
    {},
  ],
};
