import Link from "next/link";
import { Check } from "lucide-react";

export function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-10 text-center">
      <div className="flex items-end gap-2.5" aria-hidden>
        <div className="aspect-[2/3] w-12 rounded-md border border-dashed border-[#2a2a3c] bg-[#0b0b14]" />
        <div className="flex aspect-[2/3] w-14 items-center justify-center rounded-md border border-dashed border-[#3a3a50] bg-[#0b0b14]">
          <Check className="h-5 w-5 text-[#7a7a8c]" />
        </div>
        <div className="aspect-[2/3] w-12 rounded-md border border-dashed border-[#2a2a3c] bg-[#0b0b14]" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
          Nothing watched yet
        </h2>
        <p className="mx-auto max-w-md font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#9a9aac]">
          Mark films watched from a roll or film page — with a rating — and
          they’ll build your history here.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          Roll a film
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
        >
          Browse films
        </Link>
      </div>
    </div>
  );
}
