import Link from "next/link";

export function NewUserCallout() {
  return (
    <div className="mt-10 flex flex-col gap-6 rounded-xl border border-[#e8453c]/30 bg-gradient-to-br from-[#1c0f0e] to-[#0d0d1a] px-7 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
          Start building your taste profile
        </h2>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
          Two ways in: roll a random award-winner, or mark the films you’ve
          already seen. Every signal sharpens what comes next.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[13px] font-bold uppercase tracking-[0.08em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          Roll your first film <span aria-hidden>→</span>
        </Link>
        <Link
          href="/browse"
          className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#b4b4c4] underline-offset-4 transition-colors hover:text-[#F5F5F0] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          Mark films you&rsquo;ve seen
        </Link>
      </div>
    </div>
  );
}
