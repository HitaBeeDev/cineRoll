import type { UserListSummary } from "@cineroll/types";

export type UserListsResponse = {
  lists: UserListSummary[];
  total: number;
  maxLists: number;
};
