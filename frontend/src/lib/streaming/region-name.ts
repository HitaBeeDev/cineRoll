const NAMES = new Intl.DisplayNames(["en"], { type: "region" });

/** "DE" → "Germany"; the code itself when the browser has no name for it. */
export function regionName(code: string): string {
  try {
    return NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}
