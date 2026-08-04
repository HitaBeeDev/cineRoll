"use client";

import { useFieldLabelling } from "@/components/ui/field-label-context/use-field-labelling";

/**
 * Wraps a set of FilterChips as one group.
 *
 * Always `role="group"`, never `radiogroup`. Some of these rows take several
 * choices and some take one, but none of them are radios: every chip can be
 * clicked off again, and a radio that can be deselected is a promise ARIA does
 * not let you make. The chips carry `aria-pressed` instead, which describes what
 * they actually do — and a group of buttons is tabbable as it stands, where a
 * radiogroup would additionally owe the user arrow-key navigation.
 *
 * `label` is only needed outside a PanelSection; inside one the section's visible
 * caption names the group.
 */
export function ChipGroup({
  label,
  columns = false,
  children,
}: {
  label?: string;
  /**
   * Lay the chips out on a fixed three-column grid instead of letting them wrap.
   *
   * Wrapping breaks wherever the labels happen to run out of room, and for a set
   * of five that landed four on the first line and orphaned the fifth ("TV
   * Series") on a line of its own — which reads as a mistake rather than a fifth
   * choice. A grid breaks 3 and 2 at every width, and the chips come out on a
   * shared width besides, so the row scans as one set of options.
   */
  columns?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      {...useFieldLabelling(label)}
      className={columns ? "grid grid-cols-3 gap-1" : "flex flex-wrap gap-1"}
    >
      {children}
    </div>
  );
}
