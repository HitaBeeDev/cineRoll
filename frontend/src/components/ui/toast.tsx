"use client";

import * as React from "react";
import Link from "next/link";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info, ArrowRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "signin";
// Plain feedback should clear quickly; conversion nudges that carry an action
// pass their own longer duration so the user has time to reach the CTA.
const DEFAULT_TOAST_DURATION = 4500;

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

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-[#888899]" />,
  success: <CheckCircle className="h-4 w-4 text-[#7ee787]" />,
  error: <AlertCircle className="h-4 w-4 text-[#e8453c]" />,
  // Gold tuning glyph — mirrors the home-page SignInPrompt: reads as
  // "reward / taste", not an alert.
  signin: <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />,
};

const borderAccents: Record<ToastVariant, string> = {
  default: "border-[#34344a]",
  success: "border-[#3fb950]/40",
  error: "border-[#e8453c]/45",
  signin: "border-[#D4AF37]/25",
};

const iconBadges: Record<ToastVariant, string> = {
  default: "border-white/10 bg-white/[0.06]",
  success: "border-[#3fb950]/30 bg-[#3fb950]/12",
  error: "border-[#e8453c]/30 bg-[#e8453c]/12",
  signin: "border-[#D4AF37]/30 bg-[#D4AF37]/12",
};

// Surface gradient per variant. The sign-in nudge uses the warm purple-black
// of the home-page SignInPrompt instead of the neutral feedback surface.
const surfaces: Record<ToastVariant, string> = {
  default: "from-[#1c1c25] to-[#141418]",
  success: "from-[#1c1c25] to-[#141418]",
  error: "from-[#1c1c25] to-[#141418]",
  signin: "from-[#16121f] to-[#0c0a12]",
};

function ToastProgress({ duration }: { duration: number }) {
  const [remaining, setRemaining] = React.useState(100);

  React.useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const elapsed = now - startedAt;
      const nextRemaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setRemaining(nextRemaining);
      if (nextRemaining > 0) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <span className="absolute inset-x-0 bottom-0 h-1 bg-[#1a1a26]" aria-hidden>
      <span
        className="block h-full bg-[#5a5a72]"
        style={{ width: `${remaining}%` }}
      />
    </span>
  );
}

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
          return (
            <ToastPrimitive.Root
              key={t.id}
              open
              onOpenChange={(open) => !open && dismiss(t.id)}
              duration={duration}
              className={cn(
                "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
                "rounded-xl border bg-gradient-to-b px-4 py-3.5 shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-black/40",
                surfaces[variant],
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
                "transition-all duration-300",
                "data-[state=open]:opacity-100 data-[state=open]:translate-x-0",
                "data-[state=closed]:opacity-0 data-[state=closed]:translate-x-3",
                "data-[state=open]:ease-out data-[state=closed]:ease-in",
                "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
                "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:opacity-0",
                borderAccents[variant]
              )}
            >
            <ToastProgress duration={duration} />
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                iconBadges[variant]
              )}
            >
              {icons[variant]}
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
              {t.action && (
                <ToastPrimitive.Action asChild altText={t.action.label}>
                  <Link
                    href={t.action.href}
                    className={cn(
                      "mt-2 inline-flex w-fit items-center gap-1.5",
                      "font-[family-name:var(--font-geist-mono)] font-bold uppercase",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                      variant === "signin"
                        ? // Filled CineRoll red — ties to the Roll button and the
                          // home-page SignInPrompt's primary CTA.
                          "rounded-lg bg-[#e8453c] px-5 py-2 text-[11px] tracking-[0.16em] text-white shadow-[0_6px_20px_-4px_rgba(232,69,60,0.6)] transition-colors hover:bg-[#ff5247]"
                        : "rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] tracking-[0.14em] text-[#F5F5F0] transition-colors duration-150 hover:border-[#e8453c]/50 hover:bg-[#e8453c]/12 hover:text-white",
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
          );
        })}
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
