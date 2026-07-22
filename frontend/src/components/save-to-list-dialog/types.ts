import type { UserListSummary } from "@cineroll/types";

export type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; lists: UserListSummary[]; maxLists: number };
