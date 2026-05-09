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
  default: <Info className="h-4 w-4 text-[#888899]" />,
  success: <CheckCircle className="h-4 w-4 text-[#e8453c]" />,
  error: <AlertCircle className="h-4 w-4 text-[#e8453c]" />,
};

const borderAccents: Record<ToastVariant, string> = {
  default: "border-[#2a2a3e]",
  success: "border-[#e8453c]/45",
  error: "border-[#e8453c]/55",
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
              "rounded-lg border bg-[#09090f]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl",
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
                <ToastPrimitive.Title className="font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.12em] leading-tight text-[#F5F5F0]">
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description className="font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed text-[#888899]">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className={cn(
                "shrink-0 rounded-md p-0.5 text-[#555568]",
                "hover:bg-[#11111b] hover:text-[#F5F5F0]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className={cn(
            "fixed bottom-6 right-6 z-[100]",
            "flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2",
            "outline-none"
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
