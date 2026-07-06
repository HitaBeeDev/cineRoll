import { compactCategory, formatAwardBody } from "./award-formatters";
import { getAwardButtonClass } from "./get-award-button-class";
import type { BlindRollAward } from "./types";

type AwardButtonProps = {
  award: BlindRollAward;
  expanded: boolean;
  examined: boolean;
  onClick: () => void;
};

export function AwardButton({ award, expanded, examined, onClick }: AwardButtonProps) {
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
