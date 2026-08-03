import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFieldLabelling } from "@/components/ui/field-label-context";

// Constant look shared by every filter dropdown trigger. Deliberately omits the
// utilities that vary per instance (width, text colour, uppercase/tracking) —
// `cn` is a plain join with no tailwind-merge, so those must not be duplicated
// in the base or the override couldn't win.
const SELECT_TRIGGER_BASE =
  "h-10 rounded-md border-white/10 bg-white/[0.045] text-[12px] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0";

export type FilterSelectOption = { value: string; label: string };

/** A filter dropdown with the shared trigger styling, content panel, and option mapping baked in. */
export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
  align = "start",
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  /** Which trigger edge the menu hangs from — `end` for a right-aligned control. */
  align?: "start" | "end";
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger {...useFieldLabelling(ariaLabel)} className={cn(SELECT_TRIGGER_BASE, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* Below the trigger by preference, and only above it when the viewport
          genuinely has no room — a menu that flips up over the controls it was
          opened from reads as a misplacement rather than a fit. `collisionPadding`
          leaves a gutter so "fits" doesn't mean "flush against the edge". */}
      <SelectContent
        side="bottom"
        align={align}
        sideOffset={6}
        collisionPadding={12}
        className="border-white/10 bg-[#101019]"
      >
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
