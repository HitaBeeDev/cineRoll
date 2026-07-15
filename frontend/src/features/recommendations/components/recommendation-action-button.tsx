import { cn } from "@/lib/utils";
import type { RecommendationActionButtonProps } from "../recommendation-component-types";

export function RecommendationActionButton({
  label,
  icon,
  onClick,
  disabled,
  active,
}: RecommendationActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-[#e8453c]/60 bg-[#e8453c]/25 text-white"
          : "border-white/25 bg-black/45 text-white/80 hover:border-white/45 hover:text-white",
      )}
    >
      {icon}
    </button>
  );
}
