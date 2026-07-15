import type {
  NaturalRollFilters,
  NaturalRollInterpreted,
  NaturalRollResult,
} from "@/lib/api";
import { formatFilterChips } from "./format-filter-chips";

type StatusInput = {
  error: string | null;
  interpreted: NaturalRollInterpreted | null;
  isProcessing: boolean;
  noMatchFilters: NaturalRollFilters | null;
  result: NaturalRollResult | null;
};

export function getNaturalRollStatus(input: StatusInput): string {
  if (input.isProcessing) return getProcessingStatus(input.interpreted);
  if (input.error) return `Roll interrupted. ${input.error}`;
  if (input.noMatchFilters) {
    return "No matching films. Try loosening the description.";
  }
  if (!input.result) return "";

  const count = input.result.films.length;
  return `${count} ${count === 1 ? "pick" : "picks"} ready.`;
}

function getProcessingStatus(
  interpreted: NaturalRollInterpreted | null,
): string {
  if (!interpreted) return "Reading your description…";

  const chips = formatFilterChips(interpreted.interpretedFilters);
  const interpretation = chips.length > 0 ? ` as ${chips.join(", ")}` : "";
  return `Interpreted${interpretation}. Ranking the best picks…`;
}
