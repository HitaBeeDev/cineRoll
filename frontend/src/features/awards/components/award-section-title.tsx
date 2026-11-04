import type { ReactNode } from "react";

/** The small accent heading every award page section uses. */
export function AwardSectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
    >
      {children}
    </h2>
  );
}
