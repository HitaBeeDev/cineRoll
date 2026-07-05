"use client";

import * as React from "react";
import Link from "next/link";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, Check, AlertCircle, Info, ArrowRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "signin";
// Plain feedback should clear quickly and quietly; conversion nudges that carry
// an action pass their own longer duration so the user has time to reach the CTA.
const DEFAULT_TOAST_DURATION = 3200;

interface ToastAction {
  label: string;
  href: string;
}

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
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

// A single small glyph, inline (no badge box) and only where it adds meaning.
const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-3.5 w-3.5 text-[#7f7f92]" />,
  success: <Check className="h-3.5 w-3.5 text-[#5fbf72]" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-[#e8695f]" />,
  signin: <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4AF37]" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((options: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = options.duration ?? DEFAULT_TOAST_DURATION;
    setToasts((prev) => [...prev, { ...options, duration, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => {
          const duration = t.duration ?? DEFAULT_TOAST_DURATION;
          const variant = t.variant ?? "default";
          const hasAction = Boolean(t.action);
          return (
            <ToastPrimitive.Root
              key={t.id}
              open
              onOpenChange={(open) => !open && dismiss(t.id)}
              duration={duration}
              className={cn(
                "group pointer-events-auto relative flex items-start gap-2.5",
                "rounded-lg border border-white/10 bg-[#16161d]/95 px-3.5 py-2.5 backdrop-blur-sm",
                "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]",
                // soft, non-intrusive entrance/exit
                "transition-all duration-200 ease-out",
                "data-[state=open]:opacity-100 data-[state=open]:translate-y-0",
                "data-[state=closed]:opacity-0 data-[state=closed]:translate-y-1",
                "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
                "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:opacity-0",
              )}
            >
              <span className="mt-px flex shrink-0 items-center" aria-hidden>
                {icons[variant]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {t.title && (
                  <ToastPrimitive.Title className="text-[13px] font-medium leading-snug text-[#F5F5F0]">
                    {t.title}
                  </ToastPrimitive.Title>
                )}
                {t.description && (
                  <ToastPrimitive.Description className="text-xs leading-relaxed text-[#9a9aae]">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
                {t.action && (
                  <ToastPrimitive.Action asChild altText={t.action.label}>
                    <Link
                      href={t.action.href}
                      className={cn(
                        "mt-1.5 inline-flex w-fit items-center gap-1 rounded text-[13px] font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                        variant === "signin"
                          ? "rounded-md bg-[#e8453c] px-3 py-1.5 text-white transition-colors hover:bg-[#ff5247]"
                          : "text-[#e8695f] transition-colors hover:text-[#ff5247]",
                      )}
                      onClick={() => dismiss(t.id)}
                    >
                      {t.action.label}
                      {variant !== "signin" && <ArrowRight className="h-3 w-3" />}
                    </Link>
                  </ToastPrimitive.Action>
                )}
              </div>
              <ToastPrimitive.Close
                className={cn(
                  // Subtle by default, only firms up on hover — non-intrusive.
                  "-mr-1 -mt-0.5 shrink-0 rounded p-0.5 text-white/25",
                  "transition-colors duration-150 hover:text-white/70",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
                  hasAction && "self-start",
                )}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Dismiss</span>
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport
          className={cn(
            "fixed bottom-5 right-5 z-[100]",
            "flex w-[300px] max-w-[calc(100vw-2rem)] flex-col gap-2",
            "outline-none",
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
