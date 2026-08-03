/**
 * Width every boxed control in the panel snaps to.
 *
 * A band's cell is wide enough that no chip row wraps, which would otherwise
 * stretch a select to twice the width its "1994" options need. Capping them
 * keeps one field width across all three bands, so the eye reads a column of
 * controls instead of boxes of arbitrary size.
 */
export const CONTROL_WIDTH = "w-full max-w-[22rem]";

/**
 * How many of the band's columns this section occupies. A row of chips is as
 * wide as its chips: give the long ones (content types, the rating scales) two
 * columns and none of them wrap, which is what kept orphaning "TV Series", "9+"
 * and "95%+" onto lines of their own.
 */
export function PanelSection({
  label,
  children,
  span = 1,
  className,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2${span === 2 ? " md:col-span-2" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#8e899e]">
        {label}
      </span>
      {children}
    </div>
  );
}
