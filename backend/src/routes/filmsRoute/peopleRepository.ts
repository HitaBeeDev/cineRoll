import { searchPeople as searchPeopleCredits } from "../../lib/people/searchPeople";
import type { CreditSource } from "../../lib/people/types";

export type PersonSuggestion = {
  name: string;
  roles: string[];
  count: number;
};

const SOURCES: CreditSource[] = ["director", "cast", "nominee"];
const ROLE_LABELS: Record<CreditSource, string> = {
  director: "Director",
  cast: "Cast",
  nominee: "Award nominee",
};

export async function searchPeople(query: string, limit: number): Promise<PersonSuggestion[]> {
  const people = await searchPeopleCredits(query, SOURCES, limit);

  return people.map(person => ({
    name: person.name,
    roles: person.sources.map(source => ROLE_LABELS[source]),
    count: person.count,
  }));
}
