import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelHeader({ onOpenHistory }: { onOpenHistory: () => void }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#888899]">{"// CHANNEL 03 · TONIGHT"}</p>
      <button type="button" onClick={onOpenHistory} className={cn("inline-flex h-9 items-center gap-2 rounded-full border border-[#1e1e2a] bg-[#11111b] px-3 text-[#888899]", "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em]", "transition hover:border-[#6a6a85] hover:text-[#F5F5F0]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]")}>
        <Clock3 className="h-3.5 w-3.5" aria-hidden />History
      </button>
    </div>
  );
}
