"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { RollHistoryDrawer } from "@/components/home/roll-history-drawer";
import { buildRollAnnouncement } from "../build-roll-announcement";
import type { HomeExperienceProps } from "../component-props";
import { HomeControlPanel } from "./home-control-panel";
import { RollResultPanel } from "./roll-result-panel";

export function HomeExperience(props: HomeExperienceProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const announcement = buildRollAnnouncement(props.film, props.isRolling, props.pool.effectiveCount);

  return (
    <div className="isolate flex min-h-dvh flex-col overflow-x-hidden bg-[#09090f] text-[#F5F5F0] lg:h-screen lg:overflow-hidden">
      <AppHeader />
      <main className="flex min-w-0 flex-1 flex-col lg:grid lg:h-[calc(100vh-4rem)] lg:grid-cols-12 lg:overflow-hidden">
        <HomeControlPanel hero={props.hero} filters={props.filters} genres={props.genres} hasActiveFilters={props.hasActiveFilters} onFiltersChange={props.onApplyFilters} onClearFilters={props.onClearTrackedFilters} onOpenHistory={() => setHistoryOpen(true)} isRolling={props.isRolling} isSearching={props.isSearching} pool={props.pool} personalizedRoll={props.personalizedRoll} showPersonalizedRoll={Boolean(props.userId)} onRoll={props.onRoll} onTogglePersonalizedRoll={props.onTogglePersonalizedRoll} />
        <RollResultPanel effectiveCount={props.pool.effectiveCount} film={props.film} isAuthenticated={Boolean(props.userId)} isRolling={props.isRolling} reducedMotion={props.reducedMotion} rollAnnouncement={announcement} onClearFilters={props.onResetFilters} onClearAndRoll={props.onClearAndRoll} onEngage={props.onEngage} onNotInterested={props.onNotInterested} onRoll={props.onRoll} />
      </main>
      <RollHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
