import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The plot, clamped with a way out.
 *
 * A short synopsis is the right length for a card — the detail page is where the
 * full write-up lives. What was wrong was the ellipsis with nothing behind it:
 * text that stops mid-sentence and offers no way to finish it reads as a bug in
 * the layout rather than as an editorial cut, and it was doing that inside a
 * dialog the reader was already scrolling.
 *
 * So the clamp stays and the control appears — but only when there is actually
 * something being hidden. Whether the plot overflows depends on the film and on
 * how wide the card is, so it is measured rather than guessed: a short plot in a
 * wide card shows no control at all, which is the whole point of it being one.
 */
export function FilmSynopsis({ plot, lines }: { plot: string; lines: 3 | 4 }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    // Nothing to measure once it is open — the clamp is off, so the paragraph
    // is exactly as tall as its text and would always report "fits".
    if (!el || expanded) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [expanded]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, plot]);

  return (
    <div className="flex flex-col items-start gap-1">
      <p
        ref={ref}
        className={cn(
          "text-[15px] leading-[1.6] text-fg-dim",
          // Spelled out, not interpolated: Tailwind only ships a class it can
          // find as a literal string in the source.
          !expanded && (lines === 4 ? "line-clamp-4" : "line-clamp-3"),
        )}
      >
        {plot}
      </p>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((was) => !was)}
          aria-expanded={expanded}
          className={cn(
            "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em]",
            "text-fg-muted underline decoration-white/25 underline-offset-4",
            "transition-colors hover:text-fg-hi hover:decoration-white/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          )}
        >
          {expanded ? "Show less" : "Read full synopsis"}
        </button>
      )}
    </div>
  );
}
