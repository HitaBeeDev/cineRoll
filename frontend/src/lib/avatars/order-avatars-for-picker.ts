/**
 * Puts the currently-selected avatar inside the picker's collapsed head row.
 *
 * The picker only shows `previewCount` tiles until you ask for the rest. If the
 * current pick lives past that slice, the collapsed row would show a selection
 * ring nowhere — so the picker used to open fully expanded instead, which meant
 * a 48-tile wall for almost everyone (only the first 7 ids avoid it) and pushed
 * the rest of Settings off-screen.
 *
 * Rotating the selected tile to the front keeps the ring visible in one row, so
 * expanding stays a choice rather than the default state. Every other option
 * keeps its relative order, so the grid still reads as a stable, ordered set.
 */
export function orderAvatarsForPicker<T extends { id: string }>(
  options: readonly T[],
  selectedId: string | null,
  previewCount: number,
): T[] {
  const index = selectedId ? options.findIndex((option) => option.id === selectedId) : -1;
  if (index < previewCount) return [...options];

  const selected = options[index]!;
  return [selected, ...options.filter((_, i) => i !== index)];
}
