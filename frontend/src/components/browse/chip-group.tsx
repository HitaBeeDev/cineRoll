"use client";

import { useFieldLabelling } from "@/components/ui/field-label-context";

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
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" {...useFieldLabelling(label)} className="flex flex-wrap gap-1">
      {children}
    </div>
  );
}
