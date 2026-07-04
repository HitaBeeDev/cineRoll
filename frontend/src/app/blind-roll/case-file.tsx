import { compactCategory, formatAwardBody } from "./award-formatters";
import type { AwardSummary, BlindRollAward, ClueCard } from "./types";

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

function CaseFileHeader() {
  return (
    <div className="mb-2.5 flex shrink-0 items-center justify-between gap-4">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#e8453c]">
        Case File
      </p>
      <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#D4AF37]">
        Classified
      </div>
    </div>
  );
}

function ClueCards({ cards }: { cards: ClueCard[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="mb-3 flex shrink-0 flex-wrap gap-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-2 rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778b]">
            {card.label}
          </span>
          <span className="font-[family-name:var(--font-display)] text-base font-bold leading-none">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}

type AwardTrailProps = Omit<CaseFileProps, "clueCards">;

function AwardTrail({
  awards,
  awardSummary,
  expandedAward,
  examinedAwards,
  onExamineAward,
}: AwardTrailProps) {
  if (!awardSummary) {
    return (
      <div className="rounded-xl border border-[#222232] bg-[#09090f] p-5 text-sm text-[#888899]">
        No award records are available for this blind roll.
      </div>
    );
  }

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

function AwardSummaryRow({ summary }: { summary: AwardSummary }) {
  return (
    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#77778b]">
          Award Trail
        </p>
        <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
          {summary.bodies} · {summary.yearTrail} · {summary.count}{" "}
          {summary.count === 1 ? "record" : "records"}
        </p>
      </div>
      <span className="w-fit shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#D4AF37]">
        {summary.status}
      </span>
    </div>
  );
}

type AwardButtonsProps = {
  awards: BlindRollAward[];
  expandedAward: number | null;
  examinedAwards: Set<number>;
  onExamineAward: (index: number) => void;
};

function AwardButtons({
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
            key={`${award.awardBody}-${award.awardYear}-${award.category}-${award.nominee}-${index}`}
            award={award}
            expanded={expandedAward === index}
            examined={examinedAwards.has(index)}
            onClick={() => onExamineAward(index)}
          />
        ))}
      </div>
    </div>
  );
}

type AwardButtonProps = {
  award: BlindRollAward;
  expanded: boolean;
  examined: boolean;
  onClick: () => void;
};

function AwardButton({ award, expanded, examined, onClick }: AwardButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
        getAwardButtonClass(expanded, examined),
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5 shrink-0 rounded-full", award.won ? "bg-[#4ade80]" : "bg-[#D4AF37]"].join(" ")} />
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.08em] text-[#d4d4df]">
        {formatAwardBody(award.awardBody)} {award.awardYear} · {compactCategory(award.category)}
      </span>
    </button>
  );
}

function ExpandedAward({ award }: { award: BlindRollAward | undefined }) {
  if (!award) return null;

  return (
    <div className="mt-3 flex shrink-0 items-start justify-between gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#09090f]/80 p-3">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#e8453c]">
          {formatAwardBody(award.awardBody)} · Award Year {award.awardYear}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[15px] font-bold leading-tight">
          {award.category}
        </p>
        {award.nominee && <p className="mt-1 text-xs text-[#aaaabc]">{award.nominee}</p>}
      </div>
      <span className="w-fit shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#D4AF37]">
        {award.won ? "Won" : "Nominated"}
      </span>
    </div>
  );
}

function getAwardButtonClass(expanded: boolean, examined: boolean): string {
  if (expanded) return "border-[#D4AF37] bg-[#D4AF37]/12";
  if (examined) return "border-[#3a3a53] bg-[#10101b] hover:border-[#D4AF37]/50";
  return "border-[#2a2a3e] bg-[#09090f] hover:border-[#e8453c]/60 hover:bg-[#141421]";
}
