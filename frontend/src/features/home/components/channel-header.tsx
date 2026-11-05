import Link from "next/link";
import { Clock3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ChannelHeader({ onOpenHistory }: { onOpenHistory: () => void }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#888899]">{"// CHANNEL 03 · TONIGHT"}</p>
      <div className="flex items-center gap-2">
        {/* SEO: the home page's link to /collections (checklist item in
            docs/SEO-RANKING-PLAN.md). Rendered on the server, a sibling of
            History so it reads as a place to go, not a footnote. */}
        <Link href="/collections" className={PILL}>
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />Collections
        </Link>
        <button type="button" onClick={onOpenHistory} className={PILL}>
          <Clock3 className="h-3.5 w-3.5" aria-hidden />History
        </button>
      </div>
    </div>
  );
}

const PILL = cn(
  "inline-flex h-9 items-center gap-2 rounded-full border border-edge bg-ink-800 px-3 text-[#888899]",
  "font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.18em]",
  "transition hover:border-edge-hover hover:text-fg-hi",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
);
