import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mobile hamburger that opens the navigation sheet. */
export function MenuToggleButton({
  isOpen,
  onOpen,
  focusRingClassName,
}: {
  isOpen: boolean;
  onOpen: () => void;
  focusRingClassName: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full",
        "border border-[#222232] text-[#888899]",
        "transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 md:hidden",
        focusRingClassName,
      )}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      onClick={onOpen}
    >
      <Menu className="h-4 w-4" aria-hidden />
    </button>
  );
}
