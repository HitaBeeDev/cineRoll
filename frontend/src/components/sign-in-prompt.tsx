"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthGate } from "@/hooks/useFilmActions";

const GATE_COPY: Record<AuthGate, { title: string; body: string }> = {
  watched: {
    title: "Sign in to tune future rolls",
    body: "Your ratings help CineRoll learn your taste.",
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
          // Dark purple-black surface with a soft gold border — warm and
          // cinematic without going bright. Gold reads as "reward / taste",
          // tying the prompt to the award language used across the app.
          "flex items-start gap-3 px-4 py-2.5",
          surface === "card"
            ? "mt-2 rounded-xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#16121f] to-[#0c0a12]"
            : "border border-[#D4AF37]/25 bg-[#14111c]/70 backdrop-blur-sm",
        )}
      >
        {/* Gold tuning glyph — communicates personalization/taste, not an alert. */}
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/12 text-[#D4AF37]">
          <SlidersHorizontal className="h-3 w-3" aria-hidden />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] leading-tight text-[#F5F5F0]">
            {copy.title}
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
            {copy.body}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {/* Primary: filled CineRoll red so it ties to the main Roll button
                and active Seen-it state, and reads as the confident next step. */}
            <Link
              href="/auth/signin"
              className={cn(
                "inline-flex items-center rounded-lg bg-[#e8453c] px-4 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-white",
                "transition-colors hover:bg-[#ff5247]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a12]",
              )}
            >
              Sign in
            </Link>
            {/* Secondary: a quiet dark ghost button that still reads as clickable
                via a clear border + background + text shift on hover. */}
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                "rounded-lg border border-white/15 px-3 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a9aa8]",
                "transition-colors hover:border-white/35 hover:bg-white/[0.06] hover:text-white",
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
