import { cn } from "@/lib/utils";

/** Left column: headline, the adaptive primary action, and the selection hint. */
export function TasteCheckIntro({
  selectedCount,
  onDone,
  onSkip,
}: {
  selectedCount: number;
  onDone: () => void;
  onSkip: () => void;
}) {
  const hasSelection = selectedCount > 0;

  return (
    <section className="flex max-w-xl flex-col items-start">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
        {"// Taste check"}
      </p>

      <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(3.15rem,7vw,6rem)] font-bold leading-[0.9] tracking-tight">
        Which of these have you seen?
      </h1>

      <p className="mt-5 max-w-md text-base leading-7 text-[#a6a6b5]">
        Pick the films you already know. CineRoll uses this first signal to shape
        better rolls after you enter.
      </p>

      <div className="mt-8 flex w-full sm:w-auto">
        {/* One adaptive primary action: proceed with no picks reads as a soft
            "Continue" (same effect as Skip); once the user marks films it
            becomes an emphasised "Done · N" that commits the taste seed.
            The header "Skip" remains the single explicit skip affordance. */}
        <button
          type="button"
          onClick={hasSelection ? onDone : onSkip}
          className={cn(
            "min-w-[220px] px-7 py-4",
            "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em] transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
            hasSelection
              ? "bg-[#F5F5F0] text-[#09090f] hover:bg-white hover:shadow-[0_18px_50px_rgba(245,245,240,0.16)]"
              : "border border-[#2a2a3e] bg-[#11111b]/70 text-[#a6a6b5] hover:border-[#4b4b60] hover:text-[#F5F5F0]",
          )}
        >
          {hasSelection ? `Done · ${selectedCount}` : "Continue"}
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#888899]">
        <span className="h-px w-9 bg-[#e8453c]/55" />
        {hasSelection ? `${selectedCount} selected` : "Tap any poster you've seen"}
      </div>
    </section>
  );
}
