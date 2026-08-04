export function getDailyPicksCacheKey(
  day: string,
  userId: string | undefined,
): string {
  return `cinepicks-${day}-${userId ?? "guest"}`;
}
