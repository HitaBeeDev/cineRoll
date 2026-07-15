export function getUtcDay(date = new Date()): string {
  return date.toISOString().split("T")[0] ?? "";
}

export function formatPicksDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
