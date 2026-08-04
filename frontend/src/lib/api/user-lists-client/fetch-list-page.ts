import { throwApiError } from "@/lib/api/api-error/throw-api-error";
import type { ListPage } from "./list-page";
import { listPath } from "./list-path";

export async function fetchListPage(
  listId: string,
  cursor: string,
  limit: number,
): Promise<ListPage> {
  const query = `?cursor=${encodeURIComponent(cursor)}&limit=${limit}`;
  const response = await fetch(`${listPath(listId)}${query}`);
  if (!response.ok) await throwApiError(response, "Failed to load more films");
  const data = (await response.json()) as Partial<ListPage>;
  return { films: data.films ?? [], nextCursor: data.nextCursor ?? null };
}
