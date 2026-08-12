import { cn } from "@/lib/utils/cn";

/** Where a title stops being a tag and starts being a paragraph. */
const MAX_TITLE_CHARS = 18;

/**
 * The "REEL // …" channel tag above the home page's verdict header, where the
 * broadcast conceit is the frame the whole page is built on. The browse panel
 * has no such frame and dropped it: a tag naming a channel you cannot tune to,
 * carrying a clipped copy of a title set in display type just below it, was a
 * strip of decoration on a panel whose height is what it is spending.
 */
export function ChannelPill({ title, className }: { title: string; className?: string }) {
  const label = `REEL // ${clipToWord(title.toUpperCase())}`;

  return (
    <div className={cn("flex items-center", className)}>
      <span className="inline-flex items-center rounded-full border border-edge-strong bg-ink-800 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-fg-muted">
        {label}
      </span>
    </div>
  );
}

/**
 * Cuts at the last word boundary that fits, with an ellipsis to say a cut
 * happened. A hard character slice turned "To Be or Not to Be" into "TO BE OR
 * NO" — a non-word the reader has to decode before deciding it was a machine's
 * fault and not a film they had never heard of.
 *
 * A boundary in the first few characters is no better than no boundary at all,
 * so a very early space falls back to the plain cut.
 */
function clipToWord(text: string): string {
  if (text.length <= MAX_TITLE_CHARS) return text;

  const head = text.slice(0, MAX_TITLE_CHARS);
  const lastSpace = head.lastIndexOf(" ");

  return `${(lastSpace >= 6 ? head.slice(0, lastSpace) : head).trimEnd()}…`;
}
