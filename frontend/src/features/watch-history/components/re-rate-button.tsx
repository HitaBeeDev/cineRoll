import { cn } from "@/lib/utils";
import type { ReRateButtonProps } from "../component-props";

export function ReRateButton(props: ReRateButtonProps) {
  const toneClasses = props.tone === "like"
    ? getLikeClasses(props.active)
    : getDislikeClasses(props.active);

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-pressed={props.active}
      aria-label={props.label}
      title={props.label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {props.icon}
    </button>
  );
}

function getLikeClasses(active: boolean): string {
  return active
    ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
    : "border-[#1e1e2a] text-[#888899] hover:border-[#3fb950]/45 hover:text-[#7ee787]";
}

function getDislikeClasses(active: boolean): string {
  return active
    ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
    : "border-[#1e1e2a] text-[#888899] hover:border-[#e8453c]/45 hover:text-[#e8453c]";
}
