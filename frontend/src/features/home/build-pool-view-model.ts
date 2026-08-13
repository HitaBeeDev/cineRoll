export type PoolViewModel = {
  effectiveCount: number | null;
  effectiveCountLoading: boolean;
  displayCount: number | null;
  poolCountLabel: string;
  rollDisabled: boolean;
  shouldPulse: boolean;
};

type PoolViewModelInput = {
  hasActiveFilters: boolean;
  filteredCount: number | null;
  totalCount: number | null;
  countLoading: boolean;
  rolling: boolean;
  reducedMotion: boolean | null;
};

export function buildPoolViewModel(input: PoolViewModelInput): PoolViewModel {
  const effectiveCount = input.hasActiveFilters ? input.filteredCount : null;
  const effectiveCountLoading = input.hasActiveFilters && input.countLoading;
  const displayCount = effectiveCountLoading ? null : (effectiveCount ?? input.totalCount);
  return {
    effectiveCount,
    effectiveCountLoading,
    displayCount,
    poolCountLabel: formatPoolCount(effectiveCountLoading, effectiveCount, input.totalCount),
    rollDisabled: input.rolling || (input.hasActiveFilters && effectiveCount === 0 && !effectiveCountLoading),
    shouldPulse: input.hasActiveFilters && effectiveCount !== 0 && !input.rolling && !input.reducedMotion,
  };
}

/**
 * Every state of the count — loading, filtered, whole catalogue — is padded to
 * one width, because the odometer next door animates per digit slot. A
 * three-character placeholder standing in for a four-digit number re-slotted
 * every digit the moment the count landed, which briefly stacked two glyphs in
 * one slot and pushed them over the label above and the tagline below.
 *
 * Four digits covers the catalogue today, and the width follows the total on
 * its own if the archive ever passes 9,999.
 */
const MIN_COUNT_WIDTH = 4;

function formatPoolCount(loading: boolean, filtered: number | null, total: number | null): string {
  const width = Math.max(MIN_COUNT_WIDTH, String(total ?? "").length);
  const value = loading ? null : (filtered ?? total);

  return value === null ? "·".repeat(width) : String(value).padStart(width, "0");
}
