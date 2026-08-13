"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Whether a scroll container still has content past its bottom edge.
 *
 * For panes that hide their scrollbar on purpose: with no bar and no cut-off
 * line, a pane that scrolls looks exactly like a pane that has ended, and the
 * rows below it may as well not exist. This reports the one bit a fade needs,
 * remeasured when the pane is scrolled, when it is resized, and when its
 * contents change height (a filter row wrapping to a second line).
 */
export function useScrollOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [hasMore, setHasMore] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 1px of slack: fractional layout heights can leave a scrolled-to-the-end
    // pane reporting a sub-pixel remainder forever.
    setHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);

    return () => observer.disconnect();
  }, [measure]);

  return { ref, hasMore, onScroll: measure };
}
