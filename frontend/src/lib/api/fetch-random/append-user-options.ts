export function appendUserOptions(
  params: URLSearchParams,
  userId?: string,
  personalized?: boolean,
  excludeIds?: string[],
): void {
  if (userId) params.set("userId", userId);
  if (personalized && userId) params.set("personalized", "1");
  if (excludeIds?.length) params.set("excludeIds", excludeIds.join(","));
}
