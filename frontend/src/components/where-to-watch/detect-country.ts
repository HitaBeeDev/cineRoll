/** Best-effort ISO country code from the browser locale, defaulting to US. */
export function detectCountry(): string {
  const lang = navigator.language ?? "en-US";
  const parts = lang.split("-");
  return (parts[1] ?? parts[0] ?? "US").toUpperCase();
}
