import type { AwardBodyFilter, FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters";

// 25 tiles fill the 5-column desktop browse grid cleanly, so the last row does
// not end one card short on the common laptop/desktop layout.
export const PAGE_SIZE = 25;

// The decade bounds live in DEFAULT_FILTERS (the model); alias them here rather
// than re-typing 1900/2030 across the options list, panel, chips, and count.
export const DECADE_MIN = DEFAULT_FILTERS.decadeMin;
export const DECADE_MAX = DEFAULT_FILTERS.decadeMax;
export const BROWSE_DECADE_OPTIONS = Array.from(
  { length: (DECADE_MAX - DECADE_MIN) / 10 + 1 },
  (_, i) => DECADE_MIN + i * 10,
);

export type AwardStatus = "any" | "won" | "nom";
export type LoadStatus = "loading" | "success" | "error";

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

export const CONTENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "movie",       label: "Movie"       },
  { value: "short",       label: "Short"       },
  { value: "animation",   label: "Animation"   },
  { value: "documentary", label: "Documentary" },
  { value: "tv-series",   label: "TV Series"   },
];

export const STATUS_OPTIONS: { value: AwardStatus; label: string }[] = [
  { value: "any", label: "Any"  },
  { value: "won", label: "Won"  },
  { value: "nom", label: "Nom." },
];

export const SORT_OPTIONS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "IMDb" },
  { value: "rt",     label: "RT" },
  { value: "awards", label: "Awards" },
  { value: "title",  label: "A-Z" },
];
