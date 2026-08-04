"use client";

import * as React from "react";
import { ToastContext } from "./toast-context";

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
