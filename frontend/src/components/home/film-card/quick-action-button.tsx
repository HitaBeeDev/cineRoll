import { Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * One of the four roll signals.
 *
 * One shape, one weight, one resting state for all four: they are four buttons
 * in one grid under one heading, and a reader takes that to mean four things of
 * the same kind. Giving two of them borders and two of them none said the group
 * was inconsistent long before it said anything about what the signals cost —
 * the difference it was drawing (which ones write to your account) is not one
 * anybody reads out of a border.
 *
 * `tone` survives as the hover only, where a difference costs nothing until the
 * pointer is already on the button that is about to act: the permanent hide
 * warms to a warning colour, the session skip goes cool, the rest confirm green.
 *
 * Sentence case, not tracked capitals: these are four short phrases read in a
 * glance, and spaced-out uppercase is the slowest way to set that.
 */
export function QuickActionButton({
  tone,
  active,
  pending,
  disabled,
  requiresAuth = false,
  hint,
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
  /** Needs an account, and says so with a lock rather than by raising a sign-in
   *  modal out of nowhere when a guest presses it. */
  requiresAuth?: boolean;
  /** What the signal actually does, for the tooltip and for screen readers —
   *  the difference between "skips it" and "hides it for good" is the whole
   *  distinction between two buttons that otherwise read alike. */
  hint?: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeLabel: string;
}) {
  // One recorded look for all of them, in the same green as the confirmation
  // line below the grid, because they all mean the same thing once pressed:
  // this is on file. Which signal it was is what the label is for.
  const recorded = "border-affirm/50 bg-affirm/[0.14] text-affirm-hi";
  // Identical at rest; only the hover differs, and only in colour.
  const hover = {
    confirm: "hover:border-affirm/45 hover:text-affirm-hi",
    save: "hover:border-edge-hover hover:text-fg-hi",
    dismiss: "hover:border-caution/50 hover:text-caution",
    skip: "hover:border-edge-hover hover:text-cool",
  }[tone];
  const resting = `border-edge text-fg-muted ${hover}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      // Only the three that hold a state are toggles. "Not tonight" is a plain
      // action — it never comes back pressed — and claiming otherwise would
      // have a screen reader announce a state it can never reach.
      aria-pressed={tone === "skip" ? undefined : active}
      className={cn(
        "flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2",
        "whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[12px]",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active ? recorded : resting,
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : active ? (
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      ) : (
        icon
      )}
      <span>{active ? activeLabel : label}</span>
      {requiresAuth && !active && (
        <>
          <Lock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <span className="sr-only">(sign-in required)</span>
        </>
      )}
      {hint && <span className="sr-only">. {hint}</span>}
    </button>
  );
}
