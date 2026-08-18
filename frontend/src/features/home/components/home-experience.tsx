"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { RollHistoryDrawer } from "@/components/home/roll-history-drawer";
import { buildRollAnnouncement } from "../build-roll-announcement";
import type { HomeExperienceProps } from "../component-props";
import { buildReelFrames } from "../roll-reel/build-reel-frames";
import { useRollChoreography } from "../roll-reel/use-roll-choreography";
import { HomeControlPanel } from "./home-control-panel";
import { PosterColorBleed } from "./poster-color-bleed";
import { RollResultPanel } from "./roll-result-panel";

export function HomeExperience(props: HomeExperienceProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const announcement = buildRollAnnouncement(props.film, props.isRolling, props.pool.effectiveCount);

  // The roll's clock. The session hook above already has the film; this decides
  // when the room is allowed to see it.
  const choreography = useRollChoreography({
    film: props.film,
    isRolling: props.isRolling,
    reducedMotion: props.reducedMotion,
  });
  const reelFrames = useMemo(
    () => buildReelFrames(props.filters, props.hasActiveFilters),
    [props.filters, props.hasActiveFilters],
  );

  // House lights. Everything that is not the reel steps back while the strip is
  // running and comes up again as the card blooms — it is the same gesture a
  // cinema makes, and it puts the eye where the answer is about to appear.
  const housePhase = choreography.phase;
  const dimmed =
    housePhase === "press" || housePhase === "spin" || housePhase === "lock";

  return (
    <div className="isolate relative flex min-h-dvh flex-col overflow-x-hidden bg-ink-900 text-fg-hi lg:h-screen lg:overflow-hidden">
      <PosterColorBleed color={choreography.revealedFilm?.posterColor} />
      <AppHeader />
      <main className="flex min-w-0 flex-1 flex-col lg:grid lg:h-[calc(100vh-4rem)] lg:grid-cols-12 lg:overflow-hidden">
        <HomeControlPanel dimmed={dimmed} reducedMotion={props.reducedMotion} hero={props.hero} filters={props.filters} genres={props.genres} hasActiveFilters={props.hasActiveFilters} onFiltersChange={props.onApplyFilters} onClearFilters={props.onClearTrackedFilters} onOpenHistory={() => setHistoryOpen(true)} isRolling={props.isRolling} isSearching={props.isSearching} pool={props.pool} personalizedRoll={props.personalizedRoll} showPersonalizedRoll={Boolean(props.userId)} onRoll={props.onRoll} onTogglePersonalizedRoll={props.onTogglePersonalizedRoll} />
        <RollResultPanel effectiveCount={props.pool.effectiveCount} film={choreography.revealedFilm} isAuthenticated={Boolean(props.userId)} isRolling={props.isRolling} phase={choreography.phase} pace={choreography.pace} showLeader={choreography.showLeader} reelFrames={reelFrames} reducedMotion={props.reducedMotion} rollAnnouncement={announcement} onClearFilters={props.onResetFilters} onClearAndRoll={props.onClearAndRoll} onEngage={props.onEngage} onNotInterested={props.onNotInterested} onRoll={props.onRoll} />
      </main>
      <RollHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
