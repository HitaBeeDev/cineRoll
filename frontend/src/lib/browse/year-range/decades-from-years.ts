import { decadeOf } from "./decade-of";

/** Every decade the catalogue actually has films in, ascending. */
export function decadesFromYears(years: number[]): number[] {
  return [...new Set(years.map(decadeOf))].sort((a, b) => a - b);
}
