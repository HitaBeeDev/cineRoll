import type { AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { AWARD_BODY_LABEL } from "@/components/home/film-card/awards";

/** The itemised award record beneath the scores — the "receipts" behind the
 *  header badge's at-a-glance count, capped with a "+N more" pointer. */
export function RecognizedFor({ records, more }: { records: AwardRecord[]; more: number }) {
  return (
    <section className="mt-2">
      <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
        Recognized for
      </h3>
      <ul className="mt-1.5 flex flex-col">
        {records.map((rec, i) => (
          <li
            key={`${rec.awardBody}-${rec.awardYear}-${rec.category}-${i}`}
            className="flex items-center justify-between gap-3 border-t border-[#17171f] py-2 first:border-t-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-xs text-[#cfcfda]">
                {rec.category}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-[#6c6c80]">
                {AWARD_BODY_LABEL[rec.awardBody]} · {rec.awardYear}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.14em]",
                rec.won ? "text-[#D4AF37]" : "text-[#6c6c80]",
              )}
            >
              {rec.won ? "Won" : "Nominated"}
            </span>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-[#6c6c80]">
          +{more} more on the detail page
        </p>
      )}
    </section>
  );
}
