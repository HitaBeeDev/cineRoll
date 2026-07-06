import { RefreshCw } from "lucide-react";

type RetryButtonProps = {
  onClick: () => void;
};

export function RetryButton({ onClick }: RetryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Try Again
    </button>
  );
}
