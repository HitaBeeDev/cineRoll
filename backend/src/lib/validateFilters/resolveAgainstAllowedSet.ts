import { normalizeForMatch } from "./normalize";

export const resolveAgainstAllowedSet = (
  value: string,
  allowed: Set<string>,
  aliases: Readonly<Record<string, string>>,
): string | null => {
  const normalizedValue = normalizeForMatch(value);
  const exactMatch = findAllowedMember(normalizedValue, allowed);
  if (exactMatch) return exactMatch;

  const alias = aliases[normalizedValue];
  return alias
    ? findAllowedMember(normalizeForMatch(alias), allowed)
    : null;
};

const findAllowedMember = (
  normalizedValue: string,
  allowed: Set<string>,
): string | null => {
  for (const member of allowed) {
    if (normalizeForMatch(member) === normalizedValue) return member;
  }

  return null;
};
