import Link from "next/link";
import type { ReactNode } from "react";

/** The filled accent action on an error page — "try again", "roll a film". */
export function ErrorPrimaryAction({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-ink-900 transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
