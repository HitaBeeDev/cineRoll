import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_ROLL_HISTORY_ITEMS } from "@/lib/home-storage";

/** Drawer header: eyebrow, title, roll count, and close button. Compact so the
 *  list below (the point of the drawer) leads. */
export function DrawerHeader({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  return (
    <header className="relative z-10 shrink-0 px-6 pt-6 pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="block h-px w-6 bg-[#e8453c]" aria-hidden />
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.34em] text-[#e8453c]">
            Session Reel
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close history"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            "border border-[#1a1a28] text-[#888899]",
            "transition-all duration-150",
            "hover:border-[#e8453c]/50 hover:bg-[#e8453c]/8 hover:text-[#e8453c]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h2
          id="roll-history-title"
          className="font-[family-name:var(--font-display)] text-[2rem] font-bold leading-none tracking-tight"
        >
          Roll <span className="text-[#e8453c]">History</span>
        </h2>
        {count > 0 && (
          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899]">
            <span className="font-bold text-[#F5F5F0]">{count}</span>
            {" / "}
            {MAX_ROLL_HISTORY_ITEMS}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#5c5c70]">
        This tab only
      </p>
    </header>
  );
}
