"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthGate } from "@/hooks/useFilmActions";

const GATE_COPY: Record<AuthGate, string> = {
  watched: "Sign in to tune your future rolls",
  notInterested: "Sign in to hide films you skip",
  watchlist: "Sign in to start your watchlist",
};

/**
 * Inline auth gate for guests who tap a sign-in-only action (Watched / Save).
 * A single red line — icon + "Please sign in to…" — that links to sign-in.
 * It pushes layout in place of the tapped control instead of floating over it.
 */
export function SignInPrompt({
  gate,
  surface,
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
      <Link
        href="/auth/signin"
        className={cn(
          "mt-2 inline-flex items-center gap-1.5",
          "font-[family-name:var(--font-geist-mono)] text-[10px] font-medium uppercase tracking-[0.12em]",
          "text-[#e8453c] transition-colors hover:text-[#ff5247]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      >
        <Lock className="h-3 w-3" aria-hidden />
        {GATE_COPY[gate]}
      </Link>
    </motion.div>
  );
}
