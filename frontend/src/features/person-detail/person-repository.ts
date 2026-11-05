import { formatPersonName } from "@/lib/format/format-person-name";
import { PERSON_API_URL } from "@/features/person-detail/config/person-api-url";
import { PERSON_REVALIDATE_SECONDS } from "@/features/person-detail/config/person-revalidate-seconds";
import type { PersonData } from "./domain-types";

/**
 * A person page's data, or where an old URL moved to, or null (no such person).
 * "Moved" is an old credit-line URL (/person/written-by-damien-chazelle) that
 * stood for one real person — the backend names that person's slug.
 */
export type PersonLookup = { person: PersonData } | { movedTo: string } | null;

export async function fetchPerson(slug: string): Promise<PersonLookup> {
  const response = await fetch(
    `${PERSON_API_URL}/api/persons/${encodeURIComponent(slug)}`,
    { next: { revalidate: PERSON_REVALIDATE_SECONDS } },
  );
  if (response.status === 404) {
    const body = (await response.json().catch(() => null)) as { code?: string; redirectTo?: string } | null;
    return body?.code === "PERSON_MOVED" && body.redirectTo ? { movedTo: body.redirectTo } : null;
  }
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const person = (await response.json()) as PersonData;

  // The award data files surnames in caps ("Martin SCORSESE"). Cleaned here, at
  // the edge, so the heading, the tab title, the JSON-LD and the browse link all
  // read the same name — and the API keeps returning what the ceremony recorded.
  return { person: { ...person, name: formatPersonName(person.name) } };
}
