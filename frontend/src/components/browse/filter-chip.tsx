import { cn } from "@/lib/utils";
import { compactCount } from "@/lib/browse/facet-options";

export function FilterChip({
  active,
  onClick,
  children,
  multiple = false,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Render as a toggle (aria-pressed) rather than a single-choice radio. */
  multiple?: boolean;
  /** Films behind this chip under the other filters. `0` disables it. */
  count?: number;
}) {
  // A chip row is a fixed set, so an unreachable value is dimmed in place rather
  // than dropped — removing it would reflow the row under the pointer mid-click.
  // An active chip stays live whatever its count: it can only have reached 0
  // through the OTHER filters, and it has to remain clickable to be turned off.
  const unreachable = count === 0 && !active;

  return (
    <button
      type="button"
      role={multiple ? undefined : "radio"}
      aria-pressed={multiple ? active : undefined}
      aria-checked={multiple ? undefined : active}
      disabled={unreachable}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-[#09090f]"
          : unreachable
            ? "cursor-not-allowed border-white/[0.06] bg-transparent text-[#4b4757]"
            : "border-white/10 bg-white/[0.035] text-[#a9a5bc] hover:border-white/20 hover:text-white",
      )}
    >
      {children}
      {count != null && (
        <span
          data-facet-count
          className={cn(
            "ml-1.5 text-[11px] transition-opacity duration-200",
            active ? "text-[#09090f]/60" : unreachable ? "text-[#413e4c]" : "text-[#6f6b80]",
          )}
        >
          {compactCount(count)}
        </span>
      )}
    </button>
  );
}
