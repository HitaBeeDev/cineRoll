import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type CarouselArrowProps = {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
};

export function CarouselArrow({
  direction,
  disabled,
  onClick,
}: CarouselArrowProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous picks" : "Next picks"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        disabled
          ? "cursor-not-allowed border-[#1a1a24] text-[#3a3a48]"
          : "border-edge-strong text-[#b6b6c6] hover:border-accent/50 hover:text-fg-hi",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
