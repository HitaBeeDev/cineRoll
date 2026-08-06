import type { NaturalRollInterpreted } from "@/lib/api";

const LOW_CONFIDENCE_NOTE =
  "Couldn't pin down what you're after, so these are highly rated award films rather than a match. Try naming a mood, era, genre, or a film you like.";

/** Says what the request was actually read as.
 *
 *  The pipeline can end up ranking on nothing at all — no filters, no
 *  preferences, no reference film — in which case the picks are ordered by the
 *  quality tie-breaker alone. Showing that is the difference between an honest
 *  fallback and six confident-looking picks that answer a question nobody
 *  asked. */
export function InterpretationNote({
  interpreted,
}: {
  interpreted: NaturalRollInterpreted | null;
}) {
  const note = interpreted?.lowConfidence
    ? LOW_CONFIDENCE_NOTE
    : interpreted?.referenceNote;

  if (!note) return null;

  return (
    <p className="mb-3 shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
      {note}
    </p>
  );
}
