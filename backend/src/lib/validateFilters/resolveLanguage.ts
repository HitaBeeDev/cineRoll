import { LANGUAGE_NAME_TO_CODE } from "./languageNameToCode";
import { normalizeForMatch } from "./normalize";

export const resolveLanguage = (
  value: string,
  allowedLanguages: Set<string>,
): string | null => {
  const rawCode = value.trim().toLowerCase();
  if (allowedLanguages.has(rawCode)) return rawCode;

  const mappedCode = LANGUAGE_NAME_TO_CODE[normalizeForMatch(value)];
  return mappedCode && allowedLanguages.has(mappedCode) ? mappedCode : null;
};
