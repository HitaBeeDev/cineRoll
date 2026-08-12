import { cn } from "@/lib/utils/cn";

/**
 * One filter chip: a toggle button, announced with `aria-pressed`.
 *
 * Never a radio. Chips in a single-choice row (the rating and runtime scales)
 * clear themselves when the active one is clicked again, and ARIA radios cannot
 * be deselected — the old `role="radio"` told screen-reader users the selection
 * was permanent while the mouse behaviour said otherwise. `aria-pressed` states
 * exactly what the chip does either way, and the row's own semantics (one choice
 * or several) live in the handler that owns them.
 */
export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Films behind this chip under the other filters. Never rendered — a number
   *  on every chip turned a row of choices into a row of statistics. It is read
   *  only to decide reachability: `0` disables the chip, `undefined` (not counted
   *  yet) must not. */
  count?: number | undefined;
}) {
  // A chip row is a fixed set, so an unreachable value is dimmed in place rather
  // than dropped — removing it would reflow the row under the pointer mid-click.
  // An active chip stays live whatever its count: it can only have reached 0
  // through the OTHER filters, and it has to remain clickable to be turned off.
  const unreachable = count === 0 && !active;

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={unreachable}
      // The chip is dimmed with no number to explain it, so the reason is here.
      title={unreachable ? "No films match your other filters" : undefined}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
        active
          ? "border-accent bg-accent text-ink-900"
          : unreachable
            ? "cursor-not-allowed border-white/[0.06] bg-transparent text-edge-hover"
            : "border-white/10 bg-white/[0.035] text-fg-muted hover:border-white/20 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
