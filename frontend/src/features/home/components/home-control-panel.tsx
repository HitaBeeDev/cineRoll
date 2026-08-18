"use client";

import { motion } from "framer-motion";
import type { HomeControlPanelProps } from "../component-props";
import { ChannelHeader } from "./channel-header";
import { HeroSpotlight } from "./hero-spotlight";
import { HomeHeroFilters } from "./home-hero-filters";
import { RollControls } from "./roll-controls";

export function HomeControlPanel(props: HomeControlPanelProps) {
  return (
    // Dimmed, never disabled: the house lights go down while the reel runs, but
    // Roll stays live the whole time so a second press still rolls.
    <motion.div
      className="relative flex min-w-0 flex-col overflow-visible px-4 py-4 sm:px-8 lg:col-span-7 lg:overflow-hidden lg:px-10 lg:py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
      animate={{ opacity: props.dimmed && !props.reducedMotion ? 0.62 : 1 }}
      transition={{ duration: props.reducedMotion ? 0 : 0.32, ease: "easeOut" }}
    >
      <HeroSpotlight />
      <ChannelHeader onOpenHistory={props.onOpenHistory} />
      <HomeHeroFilters hero={props.hero} filters={props.filters} genres={props.genres} hasActiveFilters={props.hasActiveFilters} onFiltersChange={props.onFiltersChange} onClearFilters={props.onClearFilters} />
      <RollControls hasActiveFilters={props.hasActiveFilters} isRolling={props.isRolling} isSearching={props.isSearching} pool={props.pool} personalizedRoll={props.personalizedRoll} showPersonalizedRoll={props.showPersonalizedRoll} onRoll={props.onRoll} onTogglePersonalizedRoll={props.onTogglePersonalizedRoll} />
    </motion.div>
  );
}
