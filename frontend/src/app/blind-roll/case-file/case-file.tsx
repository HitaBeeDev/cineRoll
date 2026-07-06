import { AwardTrail } from "./award-trail";
import { CaseFileHeader } from "./case-file-header";
import { ClueCards } from "./clue-cards";
import type { AwardSummary, BlindRollAward, ClueCard } from "../types";

type CaseFileProps = {
  awards: BlindRollAward[];
  awardSummary: AwardSummary | null;
  clueCards: ClueCard[];
  expandedAward: number | null;
  examinedAwards: Set<number>;
  onExamineAward: (index: number) => void;
};

export function CaseFile({
  awards,
  awardSummary,
  clueCards,
  expandedAward,
  examinedAwards,
  onExamineAward,
}: CaseFileProps) {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-2xl border border-[#34344c] bg-[linear-gradient(145deg,rgba(18,18,31,0.98),rgba(8,8,14,0.98))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] lg:min-h-0 lg:flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#e8453c,#D4AF37,#e8453c)]" />
      <CaseFileHeader />
      <ClueCards cards={clueCards} />
      <AwardTrail
        awards={awards}
        awardSummary={awardSummary}
        expandedAward={expandedAward}
        examinedAwards={examinedAwards}
        onExamineAward={onExamineAward}
      />
    </section>
  );
}
