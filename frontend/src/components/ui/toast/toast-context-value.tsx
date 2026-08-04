"use client";

import type { ToastData } from "./toast-data";

export interface ToastContextValue {
  toast: (options: Omit<ToastData, "id">) => void;
}
