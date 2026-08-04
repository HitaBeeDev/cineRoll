"use client";

import * as React from "react";
import { FieldLabelContext } from "@/components/ui/field-label-context/field-label-context";

/**
 * The enclosing section's label id, if there is one. Controls used outside a
 * labelled section (the sort select, the home filter bar) get `undefined` and
 * fall back to their own `aria-label`.
 */
export function useFieldLabelId(): string | undefined {
  return React.useContext(FieldLabelContext);
}
