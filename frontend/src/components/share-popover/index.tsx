"use client";

import { useSharePopover } from "@/components/share-popover/useSharePopover";
import { SharePanel } from "@/components/share-popover/share-panel";

interface SharePopoverProps {
  /** Film slug — used to render the OG card preview via /api/og/film/[slug]. */
  slug: string;
  /** Display title, used as the share text / popover heading. */
  title: string;
  /** Canonical, absolute URL to share (origin included). */
  url: string;
  /** Optional longer blurb for channels that support a body (e.g. email). */
  caption?: string | undefined;
  /** Trigger button styling + contents, so the trigger matches its host. */
  triggerClassName?: string | undefined;
  triggerAriaLabel?: string | undefined;
  children: React.ReactNode;
}

/**
 * Share affordance with progressive enhancement:
 *  • Touch devices that support the Web Share API get the native OS share sheet.
 *  • Everywhere else, an anchored popover shows the film's OG card preview plus
 *    Copy link and a few high-intent targets (X / WhatsApp / Reddit / Email).
 *
 * The preview reuses the existing /api/og/film/[slug] image — no new rendering.
 */
export function SharePopover({
  slug,
  title,
  url,
  caption,
  triggerClassName,
  triggerAriaLabel,
  children,
}: SharePopoverProps) {
  const { triggerRef, panelRef, open, coords, handleTrigger, close } = useSharePopover({
    url,
    title,
    caption,
  });

  const ogUrl = `/api/og/film/${encodeURIComponent(slug)}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => void handleTrigger()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={triggerAriaLabel}
        className={triggerClassName}
      >
        {children}
      </button>

      {open && coords && (
        <SharePanel
          title={title}
          url={url}
          caption={caption}
          ogUrl={ogUrl}
          coords={coords}
          panelRef={panelRef}
          onClose={close}
        />
      )}
    </>
  );
}
