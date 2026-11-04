/**
 * A person's name as it should be shown. Festival lists often print surnames in
 * capitals ("Pedro ALMODÓVAR"); words of three or more letters written entirely
 * in capitals are shown in normal case ("Almodóvar"). Short ones ("II", "JR")
 * and Roman numerals ("VIII") are left alone. Lookups keep using the stored spelling.
 */
export function displayPersonName(name: string): string {
  return name
    .split(" ")
    .map(word => {
      const letters = word.replace(/[^\p{L}]/gu, "");
      const allCaps = letters.length >= 3 && letters === letters.toUpperCase() && letters !== letters.toLowerCase();
      if (!allCaps || /^[IVXLC]+$/.test(letters)) return word;
      return word
        .toLowerCase()
        .replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
    })
    .join(" ");
}
