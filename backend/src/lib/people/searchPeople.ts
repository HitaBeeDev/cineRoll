import { fetchCreditRows } from "./creditRowsRepository";
import { groupCreditRows } from "./groupCreditRows";
import type { CreditSource, PersonSuggestion } from "./types";

/**
 * The one people search behind every suggestion list: read the raw credit
 * lines, split them into people, merge the duplicates. Callers choose which
 * sources they speak for and label the roles their own way.
 */
export async function searchPeople(
  query: string,
  sources: CreditSource[],
  limit: number,
): Promise<PersonSuggestion[]> {
  const rows = await fetchCreditRows(query, sources);

  return groupCreditRows(rows, query, limit);
}
