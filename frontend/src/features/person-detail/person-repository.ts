import { formatPersonName } from "@/lib/format/format-person-name";
import { PERSON_API_URL } from "@/features/person-detail/config/person-api-url";
import { PERSON_REVALIDATE_SECONDS } from "@/features/person-detail/config/person-revalidate-seconds";
import type { PersonData } from "./domain-types";

export async function fetchPerson(slug: string): Promise<PersonData | null> {
  const response = await fetch(
    `${PERSON_API_URL}/api/persons/${encodeURIComponent(slug)}`,
    { next: { revalidate: PERSON_REVALIDATE_SECONDS } },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const person = (await response.json()) as PersonData;

  // The award data files surnames in caps ("Martin SCORSESE"). Cleaned here, at
  // the edge, so the heading, the tab title, the JSON-LD and the browse link all
  // read the same name — and the API keeps returning what the ceremony recorded.
  return { ...person, name: formatPersonName(person.name) };
}
