import { JSON_HEADERS } from "./constants";

export async function saveOnboardingGenres(genres: string[]): Promise<void> {
  const response = await fetch("/api/user/onboarding", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ genres }),
  });
  if (!response.ok && response.status !== 204) {
    throw Object.assign(new Error("Failed to save onboarding genres"), {
      status: response.status,
    });
  }
}
