import { Trophy } from "lucide-react";
import { buildTasteSummary } from "../build-taste-summary";
import type { WinnerHeadingProps } from "../component-props";

export function WinnerHeading({ champion, pickedFilms }: WinnerHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
          Tonight&apos;s Film
        </span>
        <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
        {champion.title}
      </h1>
      <p className="max-w-md text-sm leading-6 text-[#F5F5F0]/62">
        Your winner tonight. {buildTasteSummary(pickedFilms)}
      </p>
    </div>
  );
}
