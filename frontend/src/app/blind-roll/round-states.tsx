import { RefreshCw } from "lucide-react";

type ErrorStateProps = {
  onRetry: () => void;
};

export function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
        Loading blind roll...
      </p>
    </div>
  );
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="text-sm text-[#888899]">Couldn&apos;t load a film. Please try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </button>
    </div>
  );
}
