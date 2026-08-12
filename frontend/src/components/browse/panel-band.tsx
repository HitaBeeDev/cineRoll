"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * One labelled band of the advanced panel — "Awards", "Film", "Details".
 *
 * Bands are open on desktop. The panel already sits behind the Advanced
 * disclosure, so collapsing them there would put two clicks between the user and
 * any filter for space the layout is not short of; a heading plus a hairline rule
 * carries the hierarchy for free.
 *
 * `collapsible` inverts that for the compact sheet, where the same three bands
 * stack into one column roughly three screens tall. Collapsed, the sheet opens on
 * a contents page — three headings and their active counts — and the second click
 * buys a band you can actually see the whole of.
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
  collapsible = false,
  children,
}: {
  label: string;
  activeCount?: number;
  collapsible?: boolean;
  children: React.ReactNode;
}) {
  // Bands a user has narrowed open on their own: the sheet's contents page is
  // only useful while it hides things nobody is using.
  const [open, setOpen] = useState(activeCount > 0);
  const isOpen = !collapsible || open;

  const heading = (
    <>
        {/* A level above the section captions below it: bigger, heavier, brighter,
            and less letterspaced. At 11px/0.25em against their 11px/0.3em the two
            were the same typographic voice, so "AWARDS" read as a peer of "AWARD
            CATEGORY" rather than as the heading over it. */}
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold uppercase tracking-[0.16em] text-fg-hi">
          {label}
        </h3>
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
            <span className="sr-only">active filters: </span>
            {activeCount}
          </span>
        )}
      <span className="h-px flex-1 bg-white/[0.09]" aria-hidden />
      {collapsible && (
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-fg-faint transition-transform", open && "rotate-180")}
          aria-hidden
        />
      )}
    </>
  );

  return (
    <section aria-label={label} className="flex flex-col gap-4">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {heading}
        </button>
      ) : (
        <div className="flex items-center gap-3">{heading}</div>
      )}
      {isOpen && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}
