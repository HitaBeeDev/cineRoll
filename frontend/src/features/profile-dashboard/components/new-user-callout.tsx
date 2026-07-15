import Link from "next/link";

export function NewUserCallout() {
  return (
    <div className="mt-10 flex flex-col gap-6 rounded-xl border border-[#e8453c]/30 bg-gradient-to-br from-[#1c0f0e] to-[#0d0d1a] px-7 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
          Roll your first film
        </h2>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[12px] leading-relaxed text-[#9a9aac]">
          Your reel pool is ready — start with award-winning films from your
          selected genres. Rate a few and every roll sharpens what comes next.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] sm:self-auto"
      >
        Roll your first film <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
