import { RefreshCw } from "lucide-react";
import type { RollBattleErrorStateProps } from "../component-props";

export function RollBattleErrorState({ onRetry }: RollBattleErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#888899]">
        Couldn&apos;t load films. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Try Again
      </button>
    </div>
  );
}
