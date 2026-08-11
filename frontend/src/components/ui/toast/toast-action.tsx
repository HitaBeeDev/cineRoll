"use client";

export interface ToastAction {
  label: string;
  /** Navigates away. Renders as a link. */
  href?: string;
  /** Acts in place — e.g. "Undo". Renders as a button. Ignored when href is set. */
  onClick?: () => void;
}
