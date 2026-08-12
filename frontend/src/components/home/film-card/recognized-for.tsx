import type { AwardRecord } from "@cineroll/types";
import { cn } from "@/lib/utils/cn";
import { AWARD_BODY_LABEL } from "@/components/home/film-card/awards/award-body-label";

/**
 * The itemised award record — the receipts behind the header's at-a-glance
 * count, capped with a "+N more" pointer.
 *
 * Width-capped, because the category and its verdict are one statement and the
 * eye has to hold both. Across a full-width panel "Writing (Screenplay)" and
 * "Nominated" ended up ~700px apart with nothing in between, which is a table
 * without the rules that make a table readable.
 *
 * The year is the ceremony's, not the film's — a 1950 film winning at the 1952
 * ceremony is normal and looks like an error unless the heading says which
 * year is being quoted.
 */
export function RecognizedFor({ records, more }: { records: AwardRecord[]; more: number }) {
  return (
    <section className="mt-2 max-w-[34rem]">
      <h3 className="flex flex-wrap items-baseline gap-x-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        Recognized for
        <span className="normal-case tracking-[0.04em] text-edge-hover">(ceremony years)</span>
      </h3>
      <ul className="mt-1.5 flex flex-col">
        {records.map((rec, i) => (
          <li
            key={`${rec.awardBody}-${rec.awardYear}-${rec.category}-${i}`}
            className="flex items-center justify-between gap-3 border-t border-edge-subtle py-2 first:border-t-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-fg">{rec.category}</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-fg-faint">
                {AWARD_BODY_LABEL[rec.awardBody]} · {rec.awardYear}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.14em]",
                rec.won ? "text-gold" : "text-fg-faint",
              )}
            >
              {rec.won ? "Won" : "Nominated"}
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
