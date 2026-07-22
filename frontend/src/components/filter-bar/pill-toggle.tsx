import { cn } from "@/lib/utils";

/** A rounded toggle pill used throughout the filter rows. */
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
        "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em] sm:text-[11px] sm:tracking-widest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]",
        active
          ? (activeClassName ?? "border-[#d8d8e2] bg-[#d8d8e2] text-[#0c0c14]")
          : "border-[#34344d] bg-[#0e0e1a] text-[#aaaac6] hover:border-[#6a6a85] hover:text-[#F5F5F0]",
      )}
    >
      {children}
    </button>
  );
}
