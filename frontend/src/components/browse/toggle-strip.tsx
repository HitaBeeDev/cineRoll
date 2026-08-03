import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { useFieldLabelling } from "@/components/ui/field-label-context";

/**
 * Same bordered look as SegmentedControl, but every item is an independent
 * toggle (aria-pressed) rather than a single-choice radio — so award bodies can
 * be combined and the IMDb lists can sit alongside them in one strip.
 */
export function ToggleStrip({
  items,
  ariaLabel,
  label,
  className,
}: {
  items: {
    key: string;
    label: string;
    active: boolean;
    onToggle: () => void;
    groupStart?: boolean;
    /** Films behind this toggle. Never rendered — read only to decide
     *  reachability: `0` disables it, `undefined` (not counted yet) must not. */
    count?: number | undefined;
  }[];
  ariaLabel: string;
  /** Visible caption above the strip — without it users must infer what the row means. */
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-1 sm:w-auto", className)}>
      {label && (
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8e899e]">
          {label}
        </span>
      )}
      <div
        role="group"
        {...useFieldLabelling(ariaLabel)}
        className="flex w-full max-w-full flex-wrap items-center gap-1 rounded-md border border-white/10 bg-white/[0.025] p-1 sm:w-auto xl:flex-nowrap"
      >
        {items.map((item, i) => {
          // Same rule as the filter chips: dim in place, never remove — and an
          // active toggle stays clickable so it can always be turned back off.
          const unreachable = item.count === 0 && !item.active;
          return (
            <Fragment key={item.key}>
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn("w-px shrink-0", item.groupStart ? "mx-1 h-5 bg-white/20" : "h-4 bg-white/10")}
                />
              )}
              <button
                type="button"
                aria-pressed={item.active}
                disabled={unreachable}
                title={unreachable ? "No films match your other filters" : undefined}
                onClick={item.onToggle}
                className={cn(
                  "h-8 shrink-0 rounded px-3 font-[family-name:var(--font-geist-mono)] text-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                  item.active
                    ? "bg-[#e8453c] text-[#09090f] shadow-[0_0_24px_rgba(232,69,60,0.24)]"
                    : unreachable
                      ? "cursor-not-allowed text-[#4b4757]"
                      : "text-[#7f7a91] hover:bg-white/[0.055] hover:text-[#f1eff8]",
                )}
              >
                {item.label}
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
