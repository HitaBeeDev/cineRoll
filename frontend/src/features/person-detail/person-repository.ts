import { PERSON_API_URL, PERSON_REVALIDATE_SECONDS } from "./config";
import type { PersonData } from "./domain-types";

export async function fetchPerson(slug: string): Promise<PersonData | null> {
  const response = await fetch(
    `${PERSON_API_URL}/api/persons/${encodeURIComponent(slug)}`,
    { next: { revalidate: PERSON_REVALIDATE_SECONDS } },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return (await response.json()) as PersonData;
}
