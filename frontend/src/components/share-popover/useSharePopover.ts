"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { POPOVER_WIDTH, VIEWPORT_MARGIN, type Coords } from "@/components/share-popover/constants";

/**
 * Owns the share popover's open state and anchoring. The trigger prefers the
 * native OS share sheet on touch devices and only falls back to the popover
 * elsewhere. When open, the panel is anchored to the trigger (opening upward
 * from the lower half of the viewport) and dismisses on Esc, outside pointer, or
 * scroll/resize.
 */
export function useSharePopover({
  url,
  title,
  caption,
}: {
  url: string;
  title: string;
  caption?: string | undefined;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const handleTrigger = useCallback(async () => {
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
  }, [url, title, caption]);

  // Anchor the panel to the trigger, opening upward when the trigger sits in the
  // lower half of the viewport, and clamp to the viewport so it never spills off.
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

  return { triggerRef, panelRef, open, coords, handleTrigger, close };
}
