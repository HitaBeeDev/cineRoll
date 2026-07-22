"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clapperboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePickOfDay } from "@/components/pick-of-day/usePickOfDay";
import { PickOfDaySkeleton } from "@/components/pick-of-day/pick-of-day-skeleton";
import { PickOfDayCard } from "@/components/pick-of-day/pick-of-day-card";

/**
 * "Pick of the Day" section: loads today's staff pick and renders the
 * loading/error/empty/success states. Data lives in `usePickOfDay`; the card
 * and skeleton are their own components.
 */
export function PickOfDay() {
  const shouldReduceMotion = useReducedMotion();
  const { film, status, retry } = usePickOfDay();

  return (
    <section aria-labelledby="pod-heading" className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-amber-400" aria-hidden />
        <h2
          id="pod-heading"
          className="text-xs font-semibold tracking-widest uppercase text-zinc-400"
        >
          Pick of the Day
        </h2>
      </div>

      {status === "loading" && <PickOfDaySkeleton />}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-sm text-zinc-500">Couldn&apos;t load today&apos;s pick.</p>
          <Button variant="ghost" size="sm" onClick={() => void retry()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </Button>
        </div>
      )}

      {status === "empty" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <Clapperboard className="h-8 w-8 text-zinc-700" aria-hidden />
          <p className="text-sm text-zinc-500">No pick today, roll to discover!</p>
        </div>
      )}

      {status === "success" && film && (
        <motion.div
          layout={!shouldReduceMotion}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
        >
          <PickOfDayCard film={film} />
        </motion.div>
      )}
    </section>
  );
}
