import { cn } from "@/lib/utils";

export function FilterChip({
  active,
  onClick,
  children,
  multiple = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Render as a toggle (aria-pressed) rather than a single-choice radio. */
  multiple?: boolean;
}) {
  return (
    <button
      type="button"
      role={multiple ? undefined : "radio"}
      aria-pressed={multiple ? active : undefined}
      aria-checked={multiple ? undefined : active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-[#09090f]"
          : "border-white/10 bg-white/[0.035] text-[#a9a5bc] hover:border-white/20 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
