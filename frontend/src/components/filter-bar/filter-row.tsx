/** A labelled row: a fixed-width caption on the left, wrapping controls beside it. */
export function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 sm:gap-3">
      <span className="w-[40px] shrink-0 pt-[7px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#a2a2bb] sm:w-[42px] sm:text-[11px] sm:tracking-widest">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
