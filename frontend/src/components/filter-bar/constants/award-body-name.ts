import type { AwardBodyFilter } from "@cineroll/types";
import { AWARD_BODIES } from "./award-bodies";

export function awardBodyName(body: AwardBodyFilter): string {
  return AWARD_BODIES.find((b) => b.value === body)?.label ?? body;
}
