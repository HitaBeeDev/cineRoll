import { LISTS_PATH } from "./lists-path";

export function listPath(listId: string): string {
  return `${LISTS_PATH}/${encodeURIComponent(listId)}`;
}
