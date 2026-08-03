"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** Never fires: the value it reports is fixed per environment, not observed. */
const noSubscribe = () => () => {};

/**
 * Manages the mobile navigation sheet: open state, portal-mount readiness, and
 * — while open — Escape-to-close plus a scroll lock on the document that is
 * restored on close.
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // "Is there a document to portal into yet" — false on the server, true once
  // hydrated. `useSyncExternalStore` rather than the setState-in-an-effect this
  // used to be: that pattern renders, then immediately re-renders to correct
  // itself, which is what `react-hooks/set-state-in-effect` is pointing at.
  // Same idiom as useIsCompactViewport, for the same reason.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    mounted,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
