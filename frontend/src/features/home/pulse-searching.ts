export function pulseSearching(
  activeFilters: boolean,
  reducedMotion: boolean | null,
  setSearching: (searching: boolean) => void,
): void {
  if (!activeFilters || reducedMotion) return;
  setSearching(true);
  window.setTimeout(() => setSearching(false), 150);
}
