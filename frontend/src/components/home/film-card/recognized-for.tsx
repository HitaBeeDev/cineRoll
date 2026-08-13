import type { AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils/cn";
import { AWARD_BODY_LABEL } from "@/components/home/film-card/awards/award-body-label";

/**
 * The itemised award record — the receipts behind the header's at-a-glance
 * count, capped with a "+N more" pointer.
 *
 * One award is one statement — this body, that year, this category, won or
 * nominated — so it is set as one: the category on top, and the verdict on the
 * line under it as the last term of the credit line it belongs to. Pushed to the
 * far right of the row it was a third fragment floating in its own column,
 * aligned to nothing and needing the eye to travel the width of the panel and
 * back to read a single fact. Won stays gold and nominated recedes, which is
 * what tells them apart at a glance either way.
 *
 * The year is the ceremony's, not the film's — a 1950 film winning at the 1952
 * ceremony is normal and looks like an error unless the heading says which
 * year is being quoted.
 */
export function RecognizedFor({ records, more }: { records: AwardRecord[]; more: number }) {
  return (
    <section className="max-w-[34rem]">
      <h3 className="flex flex-wrap items-baseline gap-x-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        Recognized for
        {/* fg-faint, not edge-hover: a hairline colour used as type is 3.7:1 on
            this surface, under AA for an 11px parenthetical. */}
        <span className="normal-case tracking-[0.04em] text-fg-faint">(ceremony years)</span>
      </h3>
      <ul className="mt-1.5 flex flex-col">
        {records.map((rec, i) => (
          <li
            key={`${rec.awardBody}-${rec.awardYear}-${rec.category}-${i}`}
            className="min-w-0 border-t border-edge-subtle py-2 first:border-t-0"
          >
            {/* Wraps rather than truncates. The category IS the award — cutting
                it at "…Television Series - Musical or Co…" leaves the one line
                nobody can finish reading, and a panel that already scrolls has
                no width to defend. */}
            <span className="block text-[13px] text-fg [overflow-wrap:anywhere]">{rec.category}</span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-fg-faint">
              {AWARD_BODY_LABEL[rec.awardBody]} · {rec.awardYear} ·{" "}
              <span className={cn("font-bold", rec.won ? "text-gold" : "text-fg-muted")}>
                {rec.won ? "Won" : "Nominated"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-fg-faint">
          +{more} more on the detail page
        </p>
      )}
    </section>
  );
}
