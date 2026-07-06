type ExaminedAwardCountProps = {
  examinedCount: number;
  awardCount: number;
};

export function ExaminedAwardCount({ examinedCount, awardCount }: ExaminedAwardCountProps) {
  if (awardCount === 0) return null;

  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-[#77778b]">
      {examinedCount} of {awardCount} {awardCount === 1 ? "record" : "records"} examined
    </p>
  );
}
