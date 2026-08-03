"use client";

import * as React from "react";

const FieldLabelContext = React.createContext<string | undefined>(undefined);

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

/**
 * The enclosing section's label id, if there is one. Controls used outside a
 * labelled section (the sort select, the home filter bar) get `undefined` and
 * fall back to their own `aria-label`.
 */
export function useFieldLabelId(): string | undefined {
  return React.useContext(FieldLabelContext);
}

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
