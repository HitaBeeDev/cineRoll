import { ONBOARDED_STORAGE_KEY } from "./constants";

export function persistOnboardingFlag(): void {
  try {
    window.localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
  } catch {
    // The cookie remains the authoritative server-readable flag.
  }
}
