import { cn } from "@/lib/utils";

/** One of the four "Tune future rolls" signals. Its tone sets the active/hover
 *  palette; the label swaps to `activeLabel` once the signal is engaged. */
export function QuickActionButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
  activeLabel,
}: {
  tone: "confirm" | "dismiss" | "save" | "skip";
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeLabel: string;
}) {
  const idle = "border-[#1e1e2a] text-[#888899]";
  const neutralActive = "border-[#46465e] bg-white/[0.06] text-[#F5F5F0]";
  const toneClasses = {
    confirm: active
      ? "border-[#3fb950]/45 bg-[#3fb950]/12 text-[#7ee787]"
      : `${idle} hover:border-[#3fb950]/45 hover:text-[#7ee787]`,
    dismiss: active ? neutralActive : `${idle} hover:border-[#6a6a85] hover:text-[#F5F5F0]`,
    save: active ? neutralActive : `${idle} hover:border-[#6a6a85] hover:text-[#F5F5F0]`,
    // Session-only, low-commitment: a cool, muted hover that doesn't compete
    // with the account-signal actions.
    skip: `${idle} hover:border-[#3a4a6a] hover:text-[#9db4d0]`,
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2",
        "whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.06em]",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
      <span>{active ? activeLabel : label}</span>
    </button>
  );
}
