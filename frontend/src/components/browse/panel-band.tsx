/**
 * One labelled band of the advanced panel — "Awards", "Film", "Details".
 *
 * Bands are always open. The panel already sits behind the Advanced disclosure,
 * so making each band collapsible would put two clicks between the user and any
 * filter, add collapse state to persist, and reflow the grid on every toggle. A
 * heading plus a hairline rule carries the same hierarchy for free.
 *
 * One three-column track, shared by every band, so a control's left edge lines up
 * with the control above it in the band before — the vertical rhythm is what
 * holds a panel this dense together. Bands whose controls come in pairs break
 * their rows with PanelSection's `startsRow` rather than by switching to a grid
 * of their own, which would misalign every column below it.
 *
 * Sections used to be able to span two columns instead. That is what made the
 * bands read as ragged: a span-2 row of chips 32px tall would land beside a
 * stacked control four times its height, and the grid row took the taller of the
 * two, leaving a hole under the chips with nothing to do with them.
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
        {/* A level above the section captions below it: bigger, heavier, brighter,
            and less letterspaced. At 11px/0.25em against their 11px/0.3em the two
            were the same typographic voice, so "AWARDS" read as a peer of "AWARD
            CATEGORY" rather than as the heading over it. */}
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f1eff8]">
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
