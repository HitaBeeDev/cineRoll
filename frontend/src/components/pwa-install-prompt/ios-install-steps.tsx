import { Share, SquarePlus } from "lucide-react";

/** iOS Safari has no install event, so teach the manual Share → "Add to Home
 *  Screen" gesture with illustrated steps. */
export function IosInstallSteps() {
  return (
    <div className="mt-5">
      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#7a7a8c]">
        Two steps to add it
      </p>
      <div className="space-y-2.5 rounded-xl border border-edge bg-ink-900/60 p-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-ink-900">
            1
          </span>
          <span className="flex items-center gap-1.5 text-[13px] leading-5 text-[#c4c4d2]">
            Tap
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#2a3550] bg-[#0e1526] text-[#4a9eff]">
              <Share className="h-3.5 w-3.5" aria-hidden />
            </span>
            in the toolbar
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-ink-900">
            2
          </span>
          <span className="flex flex-wrap items-center gap-1.5 text-[13px] leading-5 text-[#c4c4d2]">
            Choose
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#242438] bg-ink-800 px-2 py-0.5 font-medium text-fg-hi">
              Add to Home Screen
              <SquarePlus className="h-3.5 w-3.5" aria-hidden />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
