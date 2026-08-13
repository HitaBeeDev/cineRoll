import { searchPeople } from "../../lib/people/searchPeople";
import type { CreditSource } from "../../lib/people/types";
import { nameToSlug } from "./slug";

const SOURCES: CreditSource[] = ["director", "nominee"];
const ROLE_LABELS: Record<CreditSource, string> = {
  director: "director",
  cast: "cast",
  nominee: "nominee",
};

export async function autocompletePeople(q: string, limit: number) {
  const people = await searchPeople(q, SOURCES, limit);

  return people.map(person => ({
    name: person.name,
    slug: nameToSlug(person.name),
    roles: person.sources.map(source => ROLE_LABELS[source]),
    count: person.count,
  }));
}
