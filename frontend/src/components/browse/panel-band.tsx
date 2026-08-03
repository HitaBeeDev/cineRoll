/**
 * One labelled band of the advanced panel — "Awards", "Film", "Details".
 *
 * Bands are always open. The panel already sits behind the Advanced disclosure,
 * so making each band collapsible would put two clicks between the user and any
 * filter, add collapse state to persist, and reflow a four-column grid on every
 * toggle. A heading plus a hairline rule carries the same hierarchy for free.
 */
export function PanelBand({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#f1eff8]">
          {label}
        </h3>
        <span className="h-px flex-1 bg-white/[0.09]" aria-hidden />
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}
