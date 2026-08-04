"use client";

import * as React from "react";
import { FieldLabelContext } from "@/components/ui/field-label-context/field-label-context";

/**
 * Publishes the id of a section's visible label so the control inside it can be
 * named by that label instead of repeating it.
 *
 * Without this, a section captioned "Award Category" holding a control with
 * `aria-label="Award category"` says it twice to a screen reader: once as text,
 * once as the control's name. Pointing the control at the caption makes the
 * visible label the single source — change the caption and the announced name
 * follows.
 */
export function FieldLabelProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return <FieldLabelContext.Provider value={id}>{children}</FieldLabelContext.Provider>;
}
