"use client";

import * as React from "react";
import type { ToastContextValue } from "./toast-context-value";

export const ToastContext = React.createContext<ToastContextValue | null>(null);
