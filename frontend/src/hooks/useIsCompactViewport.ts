"use client";

import { useSyncExternalStore } from "react";

/** Below the panel's three-column layout — where the filters need a sheet, not a drawer. */
const COMPACT_QUERY = "(max-width: 1023px)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(COMPACT_QUERY).matches;
}

/**
 * Whether the viewport is too narrow for the inline filter panel.
 *
 * `useSyncExternalStore` rather than an effect: matchMedia is external state, and
 * this reads it without a render-then-correct pass. The server snapshot is
 * `false`, so the markup React sends matches the desktop layout and a narrow
 * client switches on its first commit — no hydration mismatch either way.
 */
export function useIsCompactViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
