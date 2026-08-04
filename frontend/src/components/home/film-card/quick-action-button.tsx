import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** One of the four roll signals. Its tone sets the hover palette; once the
 *  signal is engaged the button reads as recorded — filled, checked, and
 *  relabelled to `activeLabel`. */
export function QuickActionButton({
  tone,
  active,
  pending,
  disabled,
  onClick,
  icon,
  label,
  activeLabel,
}: {
  tone: "confirm" | "dismiss" | "save" | "skip";
  active: boolean;
  /** This button's own save is in flight — chosen, not yet stored. */
  pending?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeLabel: string;
}) {
  const idle = "border-[#1e1e2a] text-[#a8a8ba]";
  // One recorded look for all of them, in the same green as the confirmation
  // line below the grid, because they all mean the same thing once pressed:
  // this is on file. Which signal it was is what the label is for. A brighter
  // border alone was the whole of it before, and a brighter border is also
  // what hover does — the state you chose and the state you are pointing at
  // looked the same.
  const recorded = "border-[#3fb950]/50 bg-[#3fb950]/[0.14] text-[#7ee787]";
  const hover = {
    confirm: "hover:border-[#3fb950]/45 hover:text-[#7ee787]",
    dismiss: "hover:border-[#6a6a85] hover:text-[#F5F5F0]",
    save: "hover:border-[#6a6a85] hover:text-[#F5F5F0]",
    // Session-only, low-commitment: a cool, muted hover that doesn't compete
    // with the signals that get written down.
    skip: "hover:border-[#3a4a6a] hover:text-[#9db4d0]",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // Only the three that hold a state are toggles. "Not tonight" is a plain
      // action — it never comes back pressed — and claiming otherwise would
      // have a screen reader announce a state it can never reach.
      aria-pressed={tone === "skip" ? undefined : active}
      className={cn(
        "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2",
        "whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.06em]",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active ? recorded : cn(idle, hover),
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : active ? (
        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
      ) : (
        icon
      )}
      <span>{active ? activeLabel : label}</span>
    </button>
  );
}
