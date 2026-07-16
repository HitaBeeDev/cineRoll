import { cn } from "@/lib/utils";
import type { PersonalizedRollToggleProps } from "../component-props";

export function PersonalizedRollToggle({ enabled, onToggle }: PersonalizedRollToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={enabled} onClick={onToggle} className={cn("mt-1 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5", "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest", "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]", enabled ? "border-[#d8d8e2]/60 bg-white/[0.08] text-[#F5F5F0]" : "border-[#2a2a3e] text-[#888899] hover:border-[#6a6a85] hover:text-[#F5F5F0]")}>
      <span className={cn("relative h-3 w-5 rounded-full transition-colors", enabled ? "bg-[#8a8aa0]" : "bg-[#2a2a3e]")}><span className={cn("absolute top-0.5 h-2 w-2 rounded-full bg-white transition-all", enabled ? "left-2.5" : "left-0.5")} /></span>
      Roll from my taste
    </button>
  );
}
