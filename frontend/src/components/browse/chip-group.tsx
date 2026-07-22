/** Wraps a set of FilterChips as one group — a radiogroup for single-select, a plain group for multi-select. */
export function ChipGroup({
  label,
  children,
  multiple = false,
}: {
  label: string;
  children: React.ReactNode;
  multiple?: boolean;
}) {
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className="flex flex-wrap gap-1">
      {children}
    </div>
  );
}
