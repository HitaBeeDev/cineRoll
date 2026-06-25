"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, Link2, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

const POPOVER_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

type Coords = { top: number; left: number };

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [copied, setCopied] = useState(false);

  const ogUrl = `/api/og/film/${encodeURIComponent(slug)}`;

  async function handleTrigger() {
    // Native share is the better UX on touch — let the OS sheet handle targets.
    const canNativeShare =
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (canNativeShare) {
      try {
        const data: ShareData = { url, title };
        if (caption) data.text = caption;
        await navigator.share(data);
        return;
      } catch {
        // cancelled or unavailable — fall through to the popover
      }
    }
    setOpen((prev) => !prev);
  }

  // Anchor the panel to the trigger, opening upward when the trigger sits in the
  // lower half of the viewport (the share button usually does), and clamp to the
  // viewport so it never spills off-screen.
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight ?? 0;
      const openUp = rect.bottom > window.innerHeight / 2;

      let top = openUp ? rect.top - panelHeight - 8 : rect.bottom + 8;
      top = Math.max(
        VIEWPORT_MARGIN,
        Math.min(top, window.innerHeight - panelHeight - VIEWPORT_MARGIN),
      );

      let left = rect.right - POPOVER_WIDTH;
      left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN),
      );

      setCoords({ top, left });
    }
    place();
    // Recompute once the image loads and the panel reaches full height.
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Dismiss on Esc, outside pointerdown, or scroll/resize (avoids drift).
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onScrollResize() {
      setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — leave the link selectable below
    }
  }

  const intents: { key: string; label: string; href: string; glyph: React.ReactNode }[] = [
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      glyph: <XGlyph />,
    },
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      glyph: <WhatsAppGlyph />,
    },
    {
      key: "reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      glyph: <RedditGlyph />,
    },
    {
      key: "email",
      label: "Share by email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${caption ?? title}\n\n${url}`)}`,
      glyph: <Mail className="h-4 w-4" aria-hidden />,
    },
  ];

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

      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
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
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-md p-0.5 text-[#666680] transition-colors hover:bg-white/[0.06] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <button
                type="button"
                onClick={() => void copyLink()}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
                  "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.14em]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  copied
                    ? "border-[#3fb950]/40 bg-[#3fb950]/12 text-[#7ee787]"
                    : "border-white/12 bg-white/[0.04] text-[#d7d7e3] hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {copied ? "Link copied" : "Copy link"}
              </button>

              <div className="flex items-center gap-2">
                {intents.map((intent) => (
                  <a
                    key={intent.key}
                    href={intent.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={intent.label}
                    title={intent.label}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-10 flex-1 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[#c8c8d8]",
                      "transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                    )}
                  >
                    {intent.glyph}
                  </a>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24m4.52 9.5c-.07-.12-.27-.2-.56-.34s-1.66-.82-1.92-.91-.45-.14-.64.13-.73.92-.9 1.11-.33.2-.61.07a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.68c-.14-.24 0-.37.11-.5.11-.11.24-.27.36-.41.12-.14.16-.24.24-.4s.04-.3-.02-.42-.64-1.54-.88-2.11c-.23-.55-.46-.48-.64-.48l-.55-.01c-.18 0-.48.07-.73.34s-.96.94-.96 2.29.99 2.65 1.13 2.84c.14.18 1.95 2.98 4.73 4.18.66.28 1.18.45 1.58.58.66.21 1.27.18 1.74.11.53-.08 1.66-.68 1.89-1.33.24-.66.24-1.22.17-1.34" />
    </svg>
  );
}

function RedditGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M24 11.78a2.6 2.6 0 0 0-4.4-1.86 12.7 12.7 0 0 0-6.86-2.17l1.17-5.48 3.82.81a1.86 1.86 0 1 0 .2-.86l-4.27-.91a.43.43 0 0 0-.51.33l-1.3 6.12A12.74 12.74 0 0 0 4.6 9.92a2.6 2.6 0 1 0-2.87 4.27 5.1 5.1 0 0 0-.06.8c0 4.06 4.73 7.35 10.55 7.35s10.55-3.29 10.55-7.35a5 5 0 0 0-.06-.78A2.6 2.6 0 0 0 24 11.78M6.67 13.7a1.86 1.86 0 1 1 1.86 1.86 1.86 1.86 0 0 1-1.86-1.86m10.4 4.92a6.9 6.9 0 0 1-4.97 1.55v-.01a6.9 6.9 0 0 1-4.97-1.55.43.43 0 0 1 .6-.6 6.06 6.06 0 0 0 4.36 1.3 6.07 6.07 0 0 0 4.37-1.3.43.43 0 1 1 .61.61m-.4-3.06a1.86 1.86 0 1 1 1.86-1.86 1.86 1.86 0 0 1-1.83 1.86z" />
    </svg>
  );
}
