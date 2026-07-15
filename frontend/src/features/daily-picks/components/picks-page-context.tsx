import { DAILY_PICKS_ACCENT } from "../config";
import type { PicksPageContextProps } from "../component-props";

export function PicksPageContext({ dateLabel }: PicksPageContextProps) {
  return (
    <div className="absolute left-6 right-6 top-20 z-10 mx-auto flex max-w-screen-xl items-center gap-4 sm:left-10 sm:right-10 sm:top-24">
      <div className="flex flex-col gap-[3px]" aria-hidden>
        <div
          className="h-[2px] w-6"
          style={{ backgroundColor: DAILY_PICKS_ACCENT }}
        />
        <div
          className="h-[2px] w-3.5"
          style={{ backgroundColor: `${DAILY_PICKS_ACCENT}59` }}
        />
      </div>
      <h1
        className="font-[family-name:var(--font-geist-mono)] text-[11px] font-normal uppercase tracking-[0.35em]"
        style={{ color: DAILY_PICKS_ACCENT }}
      >
        Tonight&apos;s Picks
      </h1>
      <div className="hidden h-4 w-px bg-white/20 sm:block" />
      <p className="hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#9a9aae] sm:block">
        {dateLabel}
      </p>
    </div>
  );
}
