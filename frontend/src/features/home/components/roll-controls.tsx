import type { RollControlsProps } from "../component-props";
import { AskAiLink } from "./ask-ai-link";
import { PersonalizedRollToggle } from "./personalized-roll-toggle";
import { PoolStatus } from "./pool-status";
import { RollButton } from "./roll-button";
import { SearchingIndicator } from "./searching-indicator";

export function RollControls({ hasActiveFilters, isRolling, isSearching, pool, personalizedRoll, showPersonalizedRoll, onRoll, onTogglePersonalizedRoll }: RollControlsProps) {
  return (
    <div className="mt-5 flex shrink-0 flex-col gap-2 sm:mt-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <RollButton disabled={pool.rollDisabled} effectiveCount={pool.effectiveCount} effectiveCountLoading={pool.effectiveCountLoading} hasActiveFilters={hasActiveFilters} isRolling={isRolling} shouldPulse={pool.shouldPulse} onRoll={onRoll} />
        <PoolStatus displayCount={pool.displayCount} effectiveCount={pool.effectiveCount} effectiveCountLoading={pool.effectiveCountLoading} poolCountLabel={pool.poolCountLabel} />
        <AskAiLink />
      </div>
      {showPersonalizedRoll && <PersonalizedRollToggle enabled={personalizedRoll} onToggle={onTogglePersonalizedRoll} />}
      <SearchingIndicator count={pool.effectiveCount} visible={isSearching} />
    </div>
  );
}
