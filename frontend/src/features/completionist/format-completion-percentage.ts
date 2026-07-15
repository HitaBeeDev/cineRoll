export function formatCompletionPercentage(value: number): string {
  const precision = Number.isInteger(value) ? 0 : 1;
  return `${value.toFixed(precision)}%`;
}
