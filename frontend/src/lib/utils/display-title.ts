/** Turns a "Godfather, The" style sort-title into natural reading order. */
export function displayTitle(title: string): string {
  return title.replace(/^(.*),\s+(The|A|An)$/i, "$2 $1");
}
