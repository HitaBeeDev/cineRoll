import type { RollFilm } from "@/lib/api";
import { applyFilmRerollPenalty } from "@/lib/home-storage/reroll-penalty-calculator/apply-film-reroll-penalty";
import { getRerollPenalty } from "./get-reroll-penalty";
import { writeRerollPenalty } from "./write-reroll-penalty";

export function addRerollPenalty(
  film: Pick<RollFilm, "genres" | "contentType">,
  strength: "weak" | "strong",
): void {
  const penalty = applyFilmRerollPenalty(
    getRerollPenalty(),
    film,
    strength,
  );
  writeRerollPenalty(penalty);
}
