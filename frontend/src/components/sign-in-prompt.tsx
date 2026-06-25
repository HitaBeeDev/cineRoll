"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthGate } from "@/hooks/useFilmActions";

const GATE_COPY: Record<AuthGate, string> = {
  watched: "Sign in to mark as watched",
  notInterested: "Sign in to hide this title",
  watchlist: "Sign in to add to your Watchlist",
};

// Softer coral red than the primary CTA red (#e8453c) — reads as a gentle
// nudge, not an error.
const NUDGE_RED = "#f08a82";

/**
 * Inline auth gate for guests who tap a sign-in-only action (Watched / Save).
 * A soft-red pill — lock icon + "Sign in to…" linking to sign-in, plus a close
 * button — that pushes layout in place of the tapped control.
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
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("overflow-hidden", surface === "hero" && "w-full")}
    >
      <div
        className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#e8453c]/20 bg-[#e8453c]/[0.08] px-3 py-2"
        style={{ color: NUDGE_RED }}
      >
        <Lock className="h-3 w-3 shrink-0" aria-hidden />
        <Link
          href="/auth/signin"
          className={cn(
            "font-[family-name:var(--font-geist-mono)] text-[10px] font-normal uppercase tracking-[0.12em]",
            "transition-opacity hover:opacity-80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          {GATE_COPY[gate]}
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cn(
            "ml-auto shrink-0 rounded-md p-0.5 transition-opacity hover:opacity-70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          )}
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
