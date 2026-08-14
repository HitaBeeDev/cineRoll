import { Dices } from "lucide-react";

/** Shown when this tab has no roll history yet. */
export function EmptyReel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] px-8 text-center">
      <div className="relative mb-6">
        <div className="h-[72px] w-[72px] rounded-full border border-accent/15 bg-accent/5 flex items-center justify-center shadow-[0_0_50px_rgba(232,69,60,0.1)]">
          <Dices className="h-7 w-7 text-accent/40" aria-hidden />
        </div>
        <div className="absolute inset-0 rounded-full border border-accent/6 scale-[1.35]" />
      </div>
      <p className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold leading-[0.93] tracking-tight text-fg-hi">
        Your reel
        <br />
        is empty.
      </p>
      <p className="mt-3 text-xs leading-6 text-[#888899] max-w-[22ch]">
        Roll a film — it shows up here as a fast, clickable trail.
      </p>
    </div>
  );
}
