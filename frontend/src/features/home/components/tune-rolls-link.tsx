import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Opt-in entry to the taste check, shown next to "Ask AI" after a first roll. */
export function TuneRollsLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 sm:self-end",
        "font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-widest text-fg-muted",
        "underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg-hi",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
      )}
    >
      <SlidersHorizontal className="h-3 w-3" aria-hidden />
      Tune your rolls
    </button>
  );
}
