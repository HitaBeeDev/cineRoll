/**
 * One labelled band of the advanced panel — "Awards", "Film", "Details".
 *
 * Bands are always open. The panel already sits behind the Advanced disclosure,
 * so making each band collapsible would put two clicks between the user and any
 * filter, add collapse state to persist, and reflow the grid on every toggle. A
 * heading plus a hairline rule carries the same hierarchy for free.
 *
 * The grid stops at three columns. Four squeezed every chip row into a cell
 * narrower than its chips, so "TV Series", "9+" and "95%+" each wrapped alone
 * onto a second line and the bands read as ragged. At three, a section that
 * needs the width takes two columns (see PanelSection's `span`) and every band
 * lands on whole rows instead of trailing a half-empty one.
 *
 * `activeCount` marks the band whose filters are doing something — the same
 * badge the collapsed Advanced button shows, resolved down to which band to
 * open.
 */
export function PanelBand({
  label,
  activeCount = 0,
  children,
}: {
  label: string;
  activeCount?: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#f1eff8]">
          {label}
        </h3>
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8453c] px-1 text-[10px] font-semibold leading-none text-white">
            <span className="sr-only">active filters: </span>
            {activeCount}
          </span>
        )}
        <span className="h-px flex-1 bg-white/[0.09]" aria-hidden />
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
