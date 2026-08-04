import { ANY_YEAR } from "./any-year";

export function parseYear(value: string): number | null {
  return value === ANY_YEAR ? null : Number(value);
}
