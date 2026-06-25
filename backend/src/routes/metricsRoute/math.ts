export const toNumber = (value: bigint | number | null | undefined): number => Number(value ?? 0);

export function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1e4) / 1e4;
}
