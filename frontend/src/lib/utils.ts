export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

/** Turns a "Godfather, The" style sort-title into natural reading order. */
export function displayTitle(title: string): string {
  return title.replace(/^(.*),\s+(The|A|An)$/i, "$2 $1");
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
