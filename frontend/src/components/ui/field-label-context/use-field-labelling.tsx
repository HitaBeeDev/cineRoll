"use client";

import { useFieldLabelId } from "./use-field-label-id";

/**
 * How a control names itself: its own `aria-label` when it has something to say
 * that the section caption does not ("Year from" where the caption reads
 * "Release Year"), otherwise the caption.
 */
export function useFieldLabelling(ownLabel: string | undefined) {
  const sectionLabelId = useFieldLabelId();

  return {
    "aria-label": ownLabel,
    "aria-labelledby": ownLabel ? undefined : sectionLabelId,
  };
}
