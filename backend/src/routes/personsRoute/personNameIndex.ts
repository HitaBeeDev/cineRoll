import { getPersonCreditIndex } from "./personCreditIndex";

/** The memoized slug → name index for person pages, cast links and the persons sitemap. */
export async function getPersonNameIndex(): Promise<Map<string, string>> {
  return (await getPersonCreditIndex()).names;
}
