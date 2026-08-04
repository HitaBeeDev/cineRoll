import type { AwardBodyFilter } from "@cineroll/types";
import { AWARD_BODY_OPTIONS } from "@/lib/browse/options/award-body-options";
export function awardBodyLabel(awardBody: AwardBodyFilter): string {
  return AWARD_BODY_OPTIONS.find((o) => o.value === awardBody)?.label ?? awardBody;
}
