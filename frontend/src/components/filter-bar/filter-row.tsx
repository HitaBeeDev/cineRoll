/** A labelled row: a fixed-width caption on the left, wrapping controls beside it.
 *
 *  The caption is chrome — you read "Genre" once and then work the pills — so it
 *  keeps the small size while the pills step up. It held 10px only to fit
 *  "Status" in the column; the column is wider now, so the app has no step below
 *  11px left on it. */
export function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 sm:gap-3">
      {/* 48px: "Awards" and "Status" measure 46.2px at this size and tracking,
          so the column is sized to the longest caption rather than to a round
          number it would spill out of on a phone. */}
      <span className="w-[48px] shrink-0 pt-[7px] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#a2a2bb]">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
