import Link from "next/link";
import type { ReactNode } from "react";

/** The outlined companion action on an error page. */
export function ErrorSecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-edge-strong px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-fg-muted transition-colors hover:border-accent/40 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
    >
      {children}
    </Link>
  );
}
