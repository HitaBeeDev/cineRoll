import { AwardButtons } from "./award-buttons";
import { AwardSummaryRow } from "./award-summary-row";
import { EmptyAwardTrail } from "./empty-award-trail";
import { ExpandedAward } from "./expanded-award";
import type { AwardSummary, BlindRollAward } from "./types";

type AwardTrailProps = {
  awards: BlindRollAward[];
  awardSummary: AwardSummary | null;
  expandedAward: number | null;
  examinedAwards: Set<number>;
  onExamineAward: (index: number) => void;
};

export function AwardTrail({
  awards,
  awardSummary,
  expandedAward,
  examinedAwards,
  onExamineAward,
}: AwardTrailProps) {
  if (!awardSummary) return <EmptyAwardTrail />;

  return (
    <>
      <AwardSummaryRow summary={awardSummary} />
      <p className="mb-2 shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#555568]">
        Tap a record to examine it
      </p>
      <AwardButtons
        awards={awards}
        expandedAward={expandedAward}
        examinedAwards={examinedAwards}
        onExamineAward={onExamineAward}
      />
      <ExpandedAward award={expandedAward !== null ? awards[expandedAward] : undefined} />
    </>
  );
}
