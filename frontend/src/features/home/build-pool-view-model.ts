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

function formatPoolCount(loading: boolean, filtered: number | null, total: number | null): string {
  if (loading) return "···";
  if (filtered !== null) return String(filtered).padStart(3, "0");
  if (total !== null) return String(total).padStart(3, "0");
  return "···";
}
