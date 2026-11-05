/// <reference types="react/canary" />
"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Route changes as a soft cut: the old page lifts away and fades, the new one
 * settles up into place, and the header holds still between them.
 *
 * Built on the browser's View Transitions API (via React's <ViewTransition> and
 * Next's `experimental.viewTransition`), not a JS animation. The browser
 * snapshots the old page and animates the snapshot, so the new route renders
 * and streams normally underneath — nothing is held mounted, scroll restoration
 * is untouched, and the motion runs on the compositor. Browsers without the API
 * just swap pages instantly.
 *
 * The boundary is keyed by pathname, so only a real page change animates.
 * Search-param navigations on the same route (browse filters, a new roll) keep
 * the key and `default="none"` leaves them alone — a filter tap must feel
 * instant, not like a page turn.
 *
 * Exit is short and enter is longer and slightly delayed: the old page should
 * get out of the way fast, the new one should arrive gently.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // flex-1 (not min-h-screen) so the content area fills the viewport *minus* the
    // footer — the canonical sticky-footer pattern. min-h-0 lets a child page run
    // its own internal scroll/overflow (e.g. the describe cockpit).
    <div className="flex min-h-0 flex-1 flex-col bg-ink-900">
      <style href="cineroll-page-transition" precedence="default">{PAGE_TRANSITION_CSS}</style>
      <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </ViewTransition>
    </div>
  );
}

const PAGE_TRANSITION_CSS = `
::view-transition-old(.page-out) {
  animation: 180ms cubic-bezier(0.4, 0, 1, 1) both cr-page-out;
}
::view-transition-new(.page-in) {
  animation: 380ms cubic-bezier(0.22, 1, 0.36, 1) 90ms both cr-page-in;
}
::view-transition-group(site-header) {
  animation: none;
  z-index: 100;
}
@keyframes cr-page-out {
  to { opacity: 0; transform: translateY(-6px); filter: blur(3px); }
}
@keyframes cr-page-in {
  from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(.page-out) { animation: 120ms ease both cr-fade-out; }
  ::view-transition-new(.page-in) { animation: 160ms ease both cr-fade-in; }
  @keyframes cr-fade-out { to { opacity: 0; } }
  @keyframes cr-fade-in { from { opacity: 0; } }
}
`;
