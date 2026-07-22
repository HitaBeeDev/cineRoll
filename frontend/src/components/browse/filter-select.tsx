import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Constant look shared by every filter dropdown trigger. Deliberately omits the
// utilities that vary per instance (width, text colour, uppercase/tracking) —
// `cn` is a plain join with no tailwind-merge, so those must not be duplicated
// in the base or the override couldn't win.
const SELECT_TRIGGER_BASE =
  "h-10 rounded-md border-white/10 bg-white/[0.045] text-[12px] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0";

/** A filter dropdown with the shared trigger styling, content panel, and option mapping baked in. */
export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className={cn(SELECT_TRIGGER_BASE, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#101019]">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
