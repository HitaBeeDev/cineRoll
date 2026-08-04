"use client";

import type { ToastAction } from "./toast-action";
import type { ToastVariant } from "./toast-variant";

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}
