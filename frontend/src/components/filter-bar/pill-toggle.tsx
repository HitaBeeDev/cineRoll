import { cn } from "@/lib/utils/cn";

/** A rounded toggle pill used throughout the filter rows.
 *
 *  12px, not the 11px of the labels around it. The mono voice runs the whole UI
 *  at one small size, which made the pills — the controls the page exists to be
 *  operated by — the same volume as the captions naming them. 11px stays for
 *  chrome that is read once; anything tapped or read to decide steps up. */
export function PillToggle({
  active,
  onClick,
  children,
  activeClassName,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "max-w-full rounded-full border px-2.5 py-1.5 transition-colors duration-150 sm:px-3",
        "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] sm:text-[12px] sm:tracking-widest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-ink-900",
        active
          ? (activeClassName ?? "border-[#d8d8e2] bg-[#d8d8e2] text-[#0c0c14]")
          : "border-[#34344d] bg-[#0e0e1a] text-[#aaaac6] hover:border-edge-hover hover:text-fg-hi",
      )}
    >
      {children}
    </button>
  );
}
