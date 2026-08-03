"use client";

import { useId } from "react";
import { FieldLabelProvider } from "@/components/ui/field-label-context";

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
export function PanelSection({
  label,
  hint,
  children,
  startsRow = false,
  className,
}: {
  label: string;
  /** One line resolving what the caption leaves ambiguous — kept short enough
   *  not to become a second heading. Read out with the caption, so the control's
   *  accessible name carries it too. */
  hint?: string;
  children: React.ReactNode;
  startsRow?: boolean;
  className?: string;
}) {
  const labelId = useId();

  return (
    <div
      className={`flex flex-col gap-2${startsRow ? " xl:col-start-1" : ""}${className ? ` ${className}` : ""}`}
    >
      <span
        id={labelId}
        className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-[#8e899e]"
      >
        {label}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-[#6f6b80]">{hint}</span>
        )}
      </span>
      <FieldLabelProvider id={labelId}>{children}</FieldLabelProvider>
    </div>
  );
}
