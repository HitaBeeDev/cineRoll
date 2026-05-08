"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<ToastData, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-zinc-400" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
};

const borderAccents: Record<ToastVariant, string> = {
  default: "border-zinc-700",
  success: "border-emerald-800",
  error: "border-red-800",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((options: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            open
            onOpenChange={(open) => !open && dismiss(t.id)}
            duration={t.duration ?? 4000}
            className={cn(
              "group pointer-events-auto relative flex w-full items-start gap-3",
              "rounded-xl border bg-zinc-900 p-4 shadow-lg shadow-black/40",
              "transition-all duration-300",
              "data-[state=open]:opacity-100 data-[state=open]:translate-x-0",
              "data-[state=closed]:opacity-0 data-[state=closed]:translate-x-3",
              "data-[state=open]:ease-out data-[state=closed]:ease-in",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
              "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:opacity-0",
              borderAccents[t.variant ?? "default"]
            )}
          >
            <span className="mt-0.5 shrink-0">
              {icons[t.variant ?? "default"]}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {t.title && (
                <ToastPrimitive.Title className="text-sm font-semibold leading-tight text-zinc-100">
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description className="text-sm leading-relaxed text-zinc-400">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className={cn(
                "shrink-0 rounded-md p-0.5 text-zinc-500",
                "hover:bg-zinc-800 hover:text-zinc-100",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className={cn(
            "fixed bottom-4 right-4 z-[100]",
            "flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-2",
            "outline-none"
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
