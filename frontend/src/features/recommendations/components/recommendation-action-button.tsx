import { cn } from "@/lib/utils/cn";
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
        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-accent/60 bg-accent/25 text-white"
          : "border-white/25 bg-black/45 text-white/80 hover:border-white/45 hover:text-white",
      )}
    >
      {icon}
    </button>
  );
}
