import type { NaturalRollError, NaturalRollFilters } from "@/lib/api";

export type NaturalRollFailure =
  | { message: string; noMatchFilters: null }
  | { message: null; noMatchFilters: NaturalRollFilters };

export function getNaturalRollFailure(error: unknown): NaturalRollFailure {
  const naturalRollError = error as Partial<NaturalRollError>;

  if (
    naturalRollError.code === "NO_FILMS_FOUND" &&
    naturalRollError.interpretedFilters
  ) {
    return {
      message: null,
      noMatchFilters: naturalRollError.interpretedFilters,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Natural roll failed",
    noMatchFilters: null,
  };
}
