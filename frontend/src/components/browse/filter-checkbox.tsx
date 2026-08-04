import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * A labelled checkbox for a filter that is simply on or off.
 *
 * "Directed by a woman" was a lone chip under a caption reading "Directed by",
 * which cost a heading and a chip row — two lines of vertical space — to express
 * one boolean, and left the caption promising a control with options when there
 * was only ever this one. A checkbox states the whole filter in its own label, so
 * the caption above it can go.
 */
export function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group inline-flex cursor-pointer items-center gap-2.5 text-[12px] text-[#a9a5bc] transition-colors hover:text-[#f1eff8]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[#e8453c]/40",
          checked
            ? "border-[#e8453c] bg-[#e8453c]"
            : "border-white/20 group-hover:border-white/40",
        )}
      >
        {checked && <Check className="h-3 w-3 text-[#09090f]" />}
      </span>
      <span className={cn("font-[family-name:var(--font-geist-mono)]", checked && "text-[#f1eff8]")}>
        {label}
      </span>
    </label>
  );
}
