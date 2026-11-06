"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { DailyPick } from "../domain-types";
import { useDailyPicks } from "../use-daily-picks";
import { PicksList } from "./picks-list";
import { PicksLoading } from "./picks-loading";

type PicksPageViewProps = { serverPicks: DailyPick[]; dateLabel: string };

export function PicksPageView({ serverPicks, dateLabel }: PicksPageViewProps) {
  const shouldReduceMotion = useReducedMotion() === true;
  const { data: session, status } = useSession();
  const dailyPicks = useDailyPicks(serverPicks, session?.user?.id, status !== "loading");

  // initial={false}: picks that came with the HTML are visible from the first
  // paint — no fade-in from opacity 0, which hid them from no-JS readers and
  // held back the hero image's paint.
  return (
    <AnimatePresence mode="wait" initial={false}>
      {dailyPicks.isLoading ? (
        <PicksLoading shouldReduceMotion={shouldReduceMotion} dateLabel={dateLabel} />
      ) : (
        <PicksList picks={dailyPicks.picks} dateLabel={dateLabel} shouldReduceMotion={shouldReduceMotion} />
      )}
    </AnimatePresence>
  );
}
