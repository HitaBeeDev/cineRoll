import { cn } from "@/lib/utils";

/**
 * How many films the current filters match, shown on the sticky bar's primary row.
 *
 * This is the filter panel's feedback loop, and its position is the point. The
 * count used to live in the panel's footer, below roughly 800px of controls — so
 * clicking a chip in the top band changed a number that was off-screen, and the
 * open panel simultaneously covered the results header where the same number
 * appears. Sitting on the primary row it stays visible whichever band is being
 * worked on (the whole bar is sticky), and whether the panel is open or closed.
 *
 * Deliberately the same words as the results heading — "1,284 films" — rather
 * than a second phrasing of one fact.
 */
export function MatchCount({
  resultCount,
  isCounting,
}: {
  /** Films matching the current filters; null until the first result lands. */
  resultCount: number | null;
  isCounting: boolean;
}) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "flex h-10 shrink-0 items-center whitespace-nowrap px-1 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums text-[#8e899e] transition-opacity duration-200",
        // Keep the last count on screen, dimmed, while the next one loads — a
        // number that blanks on every click is worse than a stale one.
        isCounting && "opacity-40",
      )}
    >
      {resultCount == null
        ? "Counting…"
        : `${resultCount.toLocaleString()} ${resultCount === 1 ? "film" : "films"}`}
    </p>
  );
}
