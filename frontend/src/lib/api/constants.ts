export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const DEFAULT_DECADE_MIN = 1900;
export const DEFAULT_DECADE_MAX = 2030;

export const JSON_HEADERS = { "Content-Type": "application/json" } as const;
