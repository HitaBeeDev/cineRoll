import type { FilterState } from "@cineroll/types";
import type { ReelFrameSpec } from "./reel-frame-spec";

const AWARD_BODY_LABEL: Record<string, string> = {
  oscar: "Oscars",
  goldenglobe: "Golden Globes",
  cannes: "Cannes",
  berlin: "Berlinale",
};

/** Read when nothing is filtered: the archive as a whole, not a pool inside it. */
const ARCHIVE_VOCABULARY = [
  "Oscars",
  "Cannes",
  "Golden Globes",
  "Berlinale",
  "Palme d'Or",
  "Best Picture",
  "Golden Bear",
  "1970s",
  "Grand Prix",
  "1990s",
];

/** Roughly how many frames make one loop of the strip. */
const TARGET_FRAME_COUNT = 14;

/**
 * The words that fly past while the roll is searching.
 *
 * They are the active filters, so the strip says which pool is being drawn from
 * — filter to 1970s and Drama and those two terms are what the machine is seen
 * hunting through. With nothing filtered it reads the archive's own vocabulary
 * instead. Either way it is data already on screen, which is the whole reason
 * the reel can be honest about what it is doing.
 *
 * Blanks are interleaved so the strip is film with words on it rather than a
 * list scrolling past.
 */
export function buildReelFrames(
  filters: FilterState,
  hasActiveFilters: boolean,
): ReelFrameSpec[] {
  const words = hasActiveFilters ? collectFilterWords(filters) : [];
  const vocabulary = words.length > 0 ? words : ARCHIVE_VOCABULARY;

  const frames: ReelFrameSpec[] = [];
  let wordIndex = 0;
  let blankSeed = 0;

  while (frames.length < TARGET_FRAME_COUNT) {
    // Two words then a blank: enough stock between terms to read as film,
    // not so much that the pool stops being legible.
    frames.push({ kind: "word", text: vocabulary[wordIndex % vocabulary.length]! });
    wordIndex += 1;
    if (frames.length < TARGET_FRAME_COUNT) {
      frames.push({ kind: "word", text: vocabulary[wordIndex % vocabulary.length]! });
      wordIndex += 1;
    }
    if (frames.length < TARGET_FRAME_COUNT) {
      frames.push({ kind: "blank", seed: blankSeed });
      blankSeed += 1;
    }
  }

  return frames;
}

function collectFilterWords(filters: FilterState): string[] {
  const words: string[] = [];

  for (const body of filters.awardBodies) {
    const label = AWARD_BODY_LABEL[body];
    if (label) words.push(label);
  }
  if (filters.winnerOnly) words.push("Winners");
  if (filters.nominatedOnly) words.push("Nominated");

  words.push(...filters.genres);
  words.push(...filters.categories);
  words.push(...filters.languages);
  words.push(...filters.countries);
  words.push(...filters.contentTypes);

  const releaseSpan = formatYearSpan(filters.yearMin, filters.yearMax);
  if (releaseSpan) words.push(releaseSpan);

  const ceremonySpan =
    filters.awardYear != null
      ? String(filters.awardYear)
      : formatYearSpan(filters.awardYearMin, filters.awardYearMax);
  if (ceremonySpan) words.push(ceremonySpan);

  if (filters.director) words.push(filters.director);
  if (filters.person) words.push(filters.person);
  if (filters.search) words.push(filters.search);
  if (filters.femaleDirectorOnly) words.push("Women directors");

  if (filters.imdbRatingMin > 0) words.push(`IMDb ${filters.imdbRatingMin}+`);
  if (filters.rtScoreMin > 0) words.push(`RT ${filters.rtScoreMin}%+`);
  if (filters.certificate) words.push(filters.certificate);
  if (filters.imdbTopMoviesOnly || filters.imdbTopTvOnly) words.push("IMDb Top 250");
  if (filters.imdbTopExclude) words.push("Hidden gems");

  if (filters.runtimeMax != null) words.push(`Under ${filters.runtimeMax} min`);
  else if (filters.runtimeMin != null) words.push(`Over ${filters.runtimeMin} min`);

  if (filters.nominationCount != null) words.push(`${filters.nominationCount}+ nominations`);
  if (filters.winsMin != null) words.push(`${filters.winsMin}+ wins`);
  if (filters.ceremonyCount != null) words.push(`${filters.ceremonyCount}+ ceremonies`);

  // A frame is one line of mono at tracking — long free text (a search phrase, a
  // director's full name) would set as a bar of grey rather than a word.
  return words
    .map((word) => word.trim())
    .filter((word) => word.length > 0 && word.length <= 22);
}

function formatYearSpan(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) {
    // A whole decade is how the control writes it, so read it back that way.
    if (min % 10 === 0 && max === min + 9) return `${min}s`;
    return min === max ? String(min) : `${min}–${max}`;
  }
  return min != null ? `${min}+` : `to ${max}`;
}
