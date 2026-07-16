import type { BanditLane, RollFilm } from "@/lib/api";
import type { CurrentRoll } from "./domain-types";

export function createCurrentRoll(film: RollFilm, lane?: BanditLane): CurrentRoll {
  return { film, engaged: false, rejected: false, lane };
}
