"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { POPOVER_WIDTH, type Coords } from "@/components/share-popover/constants";
import { useCopyLink } from "@/components/share-popover/useCopyLink";
import { buildShareIntents } from "@/components/share-popover/share-intents";
import { CopyLinkButton } from "@/components/share-popover/copy-link-button";
import { ShareTargets } from "@/components/share-popover/share-targets";

/**
 * The anchored share panel, portalled to the body: the film's OG card preview,
 * a copy-link action, and the external share targets. Positioned by `coords`
 * from the parent's anchoring effect.
 */
export function SharePanel({
  title,
  url,
  caption,
  ogUrl,
  coords,
  panelRef,
  onClose,
}: {
  title: string;
  url: string;
  caption?: string | undefined;
  ogUrl: string;
  coords: Coords;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const { copied, copy } = useCopyLink(url);
  const intents = buildShareIntents(title, url, caption);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={`Share ${title}`}
      style={{ top: coords.top, left: coords.left, width: POPOVER_WIDTH }}
      className={cn(
        "fixed z-[9999] overflow-hidden rounded-2xl border border-white/12",
        "bg-[#14141f] shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-black/40",
        "animate-in fade-in zoom-in-95 duration-150",
      )}
    >
      {/* OG card preview — exactly what unfurls when the link is pasted. */}
      <div className="relative aspect-[1200/630] w-full border-b border-white/10 bg-[#0c0c14]">
        {/* The OG route already returns a sized PNG — skip the optimizer. */}
        <Image
          src={ogUrl}
          alt={`Share card for ${title}`}
          fill
          unoptimized
          sizes="320px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F5F0]">
            Share {title}
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded-md p-0.5 text-[#666680] transition-colors hover:bg-white/[0.06] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <CopyLinkButton copied={copied} onCopy={() => void copy()} />

        <ShareTargets intents={intents} onSelect={onClose} />
      </div>
    </div>,
    document.body,
  );
}
