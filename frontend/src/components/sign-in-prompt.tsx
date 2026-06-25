"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthGate } from "@/hooks/useFilmActions";

const GATE_COPY: Record<AuthGate, { title: string; body: string }> = {
  watched: {
    title: "Sign in to tune your rolls",
    body: "Marking films seen helps CineRoll learn your taste.",
  },
  watchlist: {
    title: "Sign in to save films",
    body: "Keep a watchlist and pick up where you left off.",
  },
};

/**
 * Inline auth gate for guests who tap a sign-in-only action (Watched / Save).
 * Rendered in the action row itself — it pushes layout instead of floating over
 * controls, mirroring the "How was it?" sentiment prompt. The `surface` prop
 * matches the host's idiom: rounded/dark on the roll card, square/blur on the
 * detail hero.
 */
export function SignInPrompt({
  gate,
  surface,
  onDismiss,
}: {
  gate: AuthGate;
  surface: "card" | "hero";
  onDismiss: () => void;
}) {
  const copy = GATE_COPY[gate];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("overflow-hidden", surface === "hero" && "w-full")}
    >
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 px-4 py-3.5",
          surface === "card"
            ? "mt-2 rounded-xl border border-[#2a2a3e] bg-[#0d0d1a]"
            : "border border-white/14 bg-white/[0.06] backdrop-blur-sm",
        )}
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e8453c]/30 bg-[#e8453c]/12 text-[#e8453c]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] leading-tight text-[#F5F5F0]">
            {copy.title}
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
            {copy.body}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {/* Primary: a clearly filled surface that reads as the next step,
                with a red accent reserved for hover so it doesn't compete with
                the always-red primary actions (Roll, Seen it). */}
            <Link
              href="/auth/signin"
              className={cn(
                "inline-flex items-center rounded-lg border border-white/30 bg-white/[0.14] px-4 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-white",
                "transition-colors hover:border-[#e8453c]/60 hover:bg-white/[0.2]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
              )}
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                "rounded-lg px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#888899]",
                "transition-colors hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
              )}
            >
              Not now
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#555568]",
            "transition-colors hover:bg-white/[0.06] hover:text-[#F5F5F0]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
