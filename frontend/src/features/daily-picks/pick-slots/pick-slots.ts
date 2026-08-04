import type { PickSlot } from "../domain-types";

export const PICK_SLOTS: PickSlot[] = [
  {
    num: "01",
    label: "Award Prestige",
    icon: "trophy",
    filters: {
      awardBodies: ["oscar"],
      winnerOnly: true,
      imdbRatingMin: 7.5,
    },
  },
  {
    num: "02",
    label: "World Cinema",
    icon: "clapperboard",
    filters: { awardBodies: ["cannes"], winnerOnly: true },
  },
  {
    num: "03",
    label: "Hidden Gem",
    icon: "star",
    filters: { imdbRatingMin: 7.5, imdbTopExclude: true, winsMax: 0 },
  },
];
