import type { AwardBodyFilter } from "@cineroll/types";

/**
 * The browse "scope" strip is one bordered group of independent toggles: the
 * four award corpora (multi-select — combine Oscar + Golden Globe, etc.). Award
 * bodies can coexist.
 */
export const AWARD_BODY_OPTIONS: { value: AwardBodyFilter; label: string }[] = [
  { value: "oscar",       label: "Oscar"        },
  { value: "goldenglobe", label: "Golden Globe" },
  { value: "cannes",      label: "Cannes"       },
  { value: "berlin",      label: "Berlinale"    },
];
