import { cn } from "@/lib/utils";
import { ShareGlyph } from "@/components/share-popover/share-glyphs";
import type { ShareIntent } from "@/components/share-popover/share-intents";

/** The row of external share-target links (X / WhatsApp / Telegram / Reddit / Email). */
export function ShareTargets({
  intents,
  onSelect,
}: {
  intents: ShareIntent[];
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {intents.map((intent) => (
        <a
          key={intent.key}
          href={intent.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={intent.label}
          title={intent.label}
          onClick={onSelect}
          className={cn(
            "flex h-10 flex-1 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[#c8c8d8]",
            "transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          <ShareGlyph intent={intent.key} />
        </a>
      ))}
    </div>
  );
}
