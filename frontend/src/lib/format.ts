export function formatRuntime(minutes: number | null): string {
  if (minutes == null) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

const LANGUAGE_DISPLAY =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "language" })
    : null;

/**
 * Turn a raw language value into readable copy: an ISO code like "en" becomes
 * "English". Values that are already a full name (or that can't be resolved)
 * are returned untouched, so we never show a worse label than we started with.
 */
export function formatLanguage(language: string | null | undefined): string {
  if (!language) return "";
  const trimmed = language.trim();
  // Anything longer than a 3-letter code is assumed to already be a name.
  if (trimmed.length > 3) return trimmed;
  try {
    return LANGUAGE_DISPLAY?.of(trimmed.toLowerCase()) ?? trimmed;
  } catch {
    return trimmed;
  }
}
