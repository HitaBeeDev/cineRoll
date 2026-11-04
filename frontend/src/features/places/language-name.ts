const DISPLAY = new Intl.DisplayNames(["en"], { type: "language" });

// Codes the standard names get wrong for film: TMDB uses "cn" for Cantonese and
// "sh" for Serbo-Croatian; "xx" means "no spoken language" and gets no page.
// "bn" reads "Bangla" by default, but people search for "Bengali".
const OVERRIDES: Record<string, string | null> = {
  bn: "Bengali",
  cn: "Cantonese",
  sh: "Serbo-Croatian",
  tl: "Tagalog",
  xx: null,
};

/** The English name of a language code, or null when there isn't a real one. */
export function languageName(code: string): string | null {
  if (code in OVERRIDES) return OVERRIDES[code] ?? null;
  try {
    const name = DISPLAY.of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}
