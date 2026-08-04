// Languages are stored as ISO 639-1 codes (en, fr, …); render them as names.
const LANGUAGE_DISPLAY = typeof Intl !== "undefined" && "DisplayNames" in Intl
  ? new Intl.DisplayNames(["en"], { type: "language", fallback: "code" })
  : null;

export function languageLabel(code: string): string {
  try {
    return LANGUAGE_DISPLAY?.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
