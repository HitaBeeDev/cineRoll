import Link from "next/link";

/** Onboarding top bar: wordmark and the single explicit "Skip" affordance. */
export function OnboardingHeader({ onSkip }: { onSkip: () => void }) {
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-10">
      <Link
        href="/"
        className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
      >
        Cine·Roll
      </Link>
      <button
        type="button"
        onClick={onSkip}
        className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#888899] transition hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
      >
        Skip
      </button>
    </header>
  );
}
