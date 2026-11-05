/**
 * The viewer's country from their browser languages ("de-AT" → "AT"), or null
 * when none of them names a region. Runs only on the client, after hydration.
 */
export function pickViewerRegion(languages: readonly string[]): string | null {
  for (const tag of languages) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region && /^[A-Z]{2}$/.test(region)) return region;
    } catch {
      // Malformed tag — try the next one.
    }
  }
  return null;
}
