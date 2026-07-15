"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { AppHeader } from "@/components/app-header";
import { PicksList } from "@/features/daily-picks/components/picks-list";
import { PicksLoading } from "@/features/daily-picks/components/picks-loading";
import { formatPicksDate } from "@/features/daily-picks/picks-date";
import { useDailyPicks } from "@/features/daily-picks/use-daily-picks";

export default function PicksPage() {
  const shouldReduceMotion = useReducedMotion() === true;
  const { data: session, status } = useSession();
  const dailyPicks = useDailyPicks(
    session?.user?.id,
    status !== "loading",
  );

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />
      <main>
        <AnimatePresence mode="wait">
          {dailyPicks.isLoading ? (
            <PicksLoading shouldReduceMotion={shouldReduceMotion} />
          ) : (
            <PicksList
              picks={dailyPicks.picks}
              dateLabel={formatPicksDate()}
              shouldReduceMotion={shouldReduceMotion}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
