import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type RollActionsProps = {
  canSubmit: boolean;
  isProcessing: boolean;
  showReset: boolean;
  onReset: () => void;
  onSubmit: () => void;
};

export function RollActions(props: RollActionsProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {props.showReset && (
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.isProcessing}
          className={cn(
            "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#2a2a3e] px-4 sm:px-5",
            "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest",
            "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      )}
      <button
        type="button"
        title="⌘/Ctrl + Enter"
        onClick={props.onSubmit}
        disabled={!props.canSubmit || props.isProcessing}
        className={cn(
          "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 sm:px-5",
          "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-[#F5F5F0] sm:text-xs sm:tracking-widest",
          "transition-colors hover:bg-[#d5342b] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#e8453c]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
        )}
      >
        {props.isProcessing ? (
          <span className="motion-safe:animate-pulse">Asking the algorithm…</span>
        ) : (
          <>
            <span className="min-w-0 text-center">Roll From Description</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}
