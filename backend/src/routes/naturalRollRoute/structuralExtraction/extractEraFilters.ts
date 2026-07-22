import type { Stage1Filters } from "../schemas";

type EraFilters = Pick<Stage1Filters, "decadeMin" | "decadeMax">;

export const extractEraFilters = (prompt: string): EraFilters => {
  const lastYears = prompt.match(/\blast\s+(\d{1,2})\s+years?\b/i);
  if (lastYears) return createLastYearsRange(Number(lastYears[1]));

  if (/\b(modern|recent|contemporary|new(er)?)\b/i.test(prompt)) {
    return { decadeMin: 2000 };
  }
  if (/\b(classic|old|golden age|vintage)\b/i.test(prompt)) {
    return { decadeMax: 1979 };
  }

  return extractExplicitEra(prompt);
};

const extractExplicitEra = (prompt: string): EraFilters => {
  const decade = prompt.match(/\b(18|19|20)(\d)0s\b/i);
  if (decade) return createDecadeRange(Number(`${decade[1]}${decade[2]}0`));

  const shorthand = prompt.match(/\b(?:the\s+)?['’]?(\d{2})s\b/i);
  if (shorthand) return createShorthandDecadeRange(Number(shorthand[1]));

  const afterYear = matchFourDigitYear(prompt, /\b(?:after|since|from)\s+(18|19|20)\d{2}\b/i);
  if (afterYear) return { decadeMin: afterYear };

  const beforeYear = matchFourDigitYear(prompt, /\b(?:before|pre)\s+(18|19|20)\d{2}\b/i);
  return beforeYear ? { decadeMax: beforeYear } : {};
};

const createLastYearsRange = (years: number): EraFilters => {
  const currentYear = new Date().getFullYear();

  return { decadeMin: currentYear - years, decadeMax: currentYear };
};

const createDecadeRange = (start: number): EraFilters => ({
  decadeMin: start,
  decadeMax: start + 9,
});

const createShorthandDecadeRange = (value: number): EraFilters => {
  const currentDecade = Math.floor((new Date().getFullYear() % 100) / 10) * 10;
  const century = value <= currentDecade ? 2000 : 1900;

  return createDecadeRange(century + value);
};

const matchFourDigitYear = (prompt: string, pattern: RegExp): number | null => {
  const match = prompt.match(pattern)?.[0].match(/\d{4}/)?.[0];

  return match ? Number(match) : null;
};
