import { Sparkles } from "lucide-react";

/** The amber "Why this pick" callout box. */
export function WhyPickedNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-2">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/80">
          Why this pick
        </p>
        <p className="text-xs text-zinc-300 leading-snug">{text}</p>
      </div>
    </div>
  );
}
