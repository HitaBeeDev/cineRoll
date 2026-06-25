"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthGate } from "@/hooks/useFilmActions";

const GATE_COPY: Record<AuthGate, string> = {
  watched: "Please sign in to tune future rolls",
  notInterested: "Please sign in to skip this film",
  watchlist: "Please sign in to save films",
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
          "mt-2 inline-flex items-center gap-2",
          "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.14em]",
          "text-[#e8453c] transition-colors hover:text-[#ff5247]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden />
        {GATE_COPY[gate]}
      </Link>
    </motion.div>
  );
}
