import Link from "next/link";

export function RecommendationsUnlockState() {
  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <div className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-16 text-center">
        <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
          Roll and rate a few more films to unlock your picks
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          Roll a film
        </Link>
      </div>
    </section>
  );
}
