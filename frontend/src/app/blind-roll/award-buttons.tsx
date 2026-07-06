import { AwardButton } from "./award-button";
import { getAwardKey } from "./get-award-key";
import type { BlindRollAward } from "./types";

type AwardButtonsProps = {
  awards: BlindRollAward[];
  expandedAward: number | null;
  examinedAwards: Set<number>;
  onExamineAward: (index: number) => void;
};

export function AwardButtons({
  awards,
  expandedAward,
  examinedAwards,
  onExamineAward,
}: AwardButtonsProps) {
  return (
    <div className="pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
      <div className="flex flex-wrap gap-2">
        {awards.map((award, index) => (
          <AwardButton
            award={award}
            expanded={expandedAward === index}
            examined={examinedAwards.has(index)}
            key={getAwardKey(award, index)}
            onClick={() => onExamineAward(index)}
          />
        ))}
      </div>
    </div>
  );
}
