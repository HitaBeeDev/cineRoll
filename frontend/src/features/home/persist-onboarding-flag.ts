import { ONBOARDED_STORAGE_KEY } from "@/features/home/constants/onboarded-storage-key";

export function persistOnboardingFlag(): void {
  try {
    window.localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
  } catch {
    // The cookie remains the authoritative server-readable flag.
  }
}
