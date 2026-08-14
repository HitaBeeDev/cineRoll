"use client";

import { useSyncExternalStore } from "react";

// The results panel takes the larger half of the page once a roll has landed,
// and at this width three cards sit in it without crowding. Below it the panel
// is a phone or tablet column, where two is already the honest maximum.
const WIDE_PANEL_QUERY = "(min-width: 1280px)";
const WIDE_COUNT = 3;
const NARROW_COUNT = 2;

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(WIDE_PANEL_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): number {
  return window.matchMedia(WIDE_PANEL_QUERY).matches ? WIDE_COUNT : NARROW_COUNT;
}

/**
 * How many picks the carousel shows at once.
 *
 * `useSyncExternalStore` for the same reason as `useIsCompactViewport`: the
 * viewport is external state, read once per commit rather than through a
 * render-then-correct effect. The server snapshot is the narrow count, so the
 * first paint is the safe one and a wide window widens on its first commit.
 */
export function useCarouselVisibleCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => NARROW_COUNT);
}
