"use client";

import { useId } from "react";
import { FieldLabelProvider } from "@/components/ui/field-label-context/field-label-provider";

/**
 * One captioned control in a band's grid, occupying exactly one cell. Sections
 * used to be able to span two columns, which is what let a short chip row sit
 * beside a control four times its height and leave a hole under it.
 *
 * `startsRow` pins the section to the first column, so a band whose controls come
 * in pairs gets a row per pair without leaving the shared three-column track. The
 * third column then stands empty for that band — deliberately: the pairing is
 * what the whitespace is there to say, and it costs less than either breaking the
 * panel's vertical alignment or filling the row with an unrelated control.
 *
 * The caption is also the accessible name of whatever the section holds. It is
 * published to the control through FieldLabelProvider rather than restated as an
 * `aria-label`, which had screen readers announcing "Content type" twice — once
 * reading the caption, once naming the group.
 *
 * Its letterspacing is 0.12em, not the 0.3em it carried before. At 11px that much
 * tracking pulls the word apart into separate letters and costs more legibility
 * than the styling is worth; the band heading above now carries the difference in
 * level through size and weight instead.
 */
/**
 * Two levels of caption, because a band is not a flat list of equals.
 *
 * Every caption used to be the same 11px grey, so "Genre" and "Max. Wins" — one
 * of them touched most sessions, the other almost never — cost exactly the same
 * to find. Twenty controls at one weight give the eye nowhere to land and no way
 * to skim, and the panel reads as a form to fill in rather than a set of choices
 * to make.
 *
 * `primary` marks the handful of controls each band actually leads with; they
 * take the top row and carry a brighter, heavier caption. The rest keep the old
 * one. Nothing is dimmed further to make the difference — contrast at 11px on
 * this background has none to give — so the level is carried by weight, size and
 * brightness going up rather than down.
 */
const LABEL_LEVELS = {
  primary: "text-[12px] font-semibold tracking-[0.1em] text-fg",
  default: "text-[11px] tracking-[0.12em] text-fg-faint",
} as const;

export function PanelSection({
  label,
  hint,
  children,
  startsRow = false,
  emphasis = "default",
  className,
}: {
  label: string;
  /** One line resolving what the caption leaves ambiguous — kept short enough
   *  not to become a second heading. Read out with the caption, so the control's
   *  accessible name carries it too. */
  hint?: string;
  children: React.ReactNode;
  startsRow?: boolean;
  /** `primary` for the controls a band leads with — see LABEL_LEVELS. */
  emphasis?: keyof typeof LABEL_LEVELS;
  className?: string;
}) {
  const labelId = useId();

  return (
    <div
      className={`flex flex-col gap-2${startsRow ? " xl:col-start-1" : ""}${className ? ` ${className}` : ""}`}
    >
      <span
        id={labelId}
        className={`font-[family-name:var(--font-geist-mono)] uppercase ${LABEL_LEVELS[emphasis]}`}
      >
        {label}
        {/* #7a7689 rather than the #6f6b80 this was: 4.6:1 on #08080d instead of
            3.9:1, which is the AA floor rather than just under it. The hint is
            not decoration — "across all ceremonies" changes what the control
            below it means — so it had no business being the least legible text
            on the page. It stays a step under the caption; the step is just no
            longer taken out of readable range. */}
        {hint && (
          <span className="ml-2 font-normal normal-case tracking-normal text-fg-faint">{hint}</span>
        )}
      </span>
      <FieldLabelProvider id={labelId}>{children}</FieldLabelProvider>
    </div>
  );
}
