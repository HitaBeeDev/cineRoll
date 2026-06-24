import type { ReactNode } from "react";

/**
 * Lightweight hover/focus tooltip for icon-only controls. Wraps a single
 * interactive child and reveals its label on hover or keyboard focus, so the
 * quiet hero icon buttons (Watched / Not Interested / Share) read as labelled
 * actions instead of a guessing game. Pure Tailwind — no global CSS, no JS
 * state. The label is decorative here (the wrapped control still carries its
 * own aria-label), so the bubble is aria-hidden to avoid double announcement.
 */
export function HoverTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-white/12 bg-[#0d0d14] px-2.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 opacity-0 shadow-lg shadow-black/40 transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
