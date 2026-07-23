"use client";

import { useEffect, useState } from "react";

/**
 * Manages the mobile navigation sheet: open state, portal-mount readiness, and
 * — while open — Escape-to-close plus a scroll lock on the document that is
 * restored on close.
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
