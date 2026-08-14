import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** The "Copy link" button that flips to a "Link copied" confirmation. */
export function CopyLinkButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
        "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.14em]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        copied
          ? "border-affirm/40 bg-affirm/12 text-affirm-hi"
          : "border-white/12 bg-white/[0.04] text-[#d7d7e3] hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <Link2 className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
