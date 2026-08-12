import { cn } from "@/lib/utils/cn";

/** Where a title stops being a tag and starts being a paragraph. */
const MAX_TITLE_CHARS = 18;

/**
 * The "REEL // …" channel tag that sits above the verdict header.
 *
 * Without a title it is the channel alone. That is what a caller wants when the
 * film's name is already set in display type a line below: a clipped second copy
 * of it adds nothing and, clipped badly, actively misreads.
 */
export function ChannelPill({ title, className }: { title?: string; className?: string }) {
  const label = title ? `REEL // ${clipToWord(title.toUpperCase())}` : "REEL";

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
