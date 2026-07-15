import { RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import type { WinnerActionsProps } from "../component-props";

export function WinnerActions({
  champion,
  shareStatus,
  onShare,
  onRestart,
}: WinnerActionsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Link
        href={`/film/${champion.slug}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        Watch This Tonight
      </Link>
      <button
        type="button"
        onClick={onShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        {shareStatus === "copied" ? "Copied!" : "Share My Winner"}
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1a1a28] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#555568] transition-colors hover:text-[#888899]"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Try Again
      </button>
    </div>
  );
}
