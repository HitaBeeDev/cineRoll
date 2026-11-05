import type { SavedChoice } from "./saved-choice-type";

/**
 * The viewer's last country and services from a stored string — a per-browser
 * convenience, so anything malformed simply means "ask again".
 */
export function loadChoice(raw: string | null): SavedChoice | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedChoice>;
    if (typeof parsed.region !== "string" || !/^[A-Z]{2}$/.test(parsed.region)) return null;
    const providers = Array.isArray(parsed.providers)
      ? parsed.providers.filter((id): id is number => Number.isInteger(id) && id > 0)
      : [];
    return { region: parsed.region, providers };
  } catch {
    return null;
  }
}
