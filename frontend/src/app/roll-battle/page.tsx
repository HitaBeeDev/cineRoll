"use client";

import { useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { BattleArena } from "@/features/roll-battle/components/battle-arena";
import { RollBattleErrorState } from "@/features/roll-battle/components/roll-battle-error-state";
import { RollBattleLoadingState } from "@/features/roll-battle/components/roll-battle-loading-state";
import { WinnerResult } from "@/features/roll-battle/components/winner-result";
import { useBattleWinnerShare } from "@/features/roll-battle/use-battle-winner-share";
import { useRollBattle } from "@/features/roll-battle/use-roll-battle";

export default function RollBattlePage() {
  const reducedMotion = useReducedMotion() ?? false;
  const battle = useRollBattle(reducedMotion);
  const winnerShare = useBattleWinnerShare();

  return (
    <div className="flex min-h-[calc(100dvh-73px)] flex-col overflow-y-auto overflow-x-hidden bg-[#09090f] sm:h-[calc(100dvh-73px)] sm:max-h-[calc(100dvh-73px)] sm:overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-start px-4 py-3 sm:justify-center sm:px-6">
        {battle.phase === "loading" && <RollBattleLoadingState />}
        {battle.phase === "error" && (
          <RollBattleErrorState onRetry={() => void battle.loadBattle()} />
        )}
        {battle.phase === "battling" &&
          battle.leftFilm &&
          battle.rightFilm && (
            <BattleArena
              films={battle.films}
              leftFilm={battle.leftFilm}
              rightFilm={battle.rightFilm}
              selectedFilm={battle.selectedFilm}
              championRailFilm={battle.championRailFilm}
              completedRound={battle.completedRound}
              roundsLeft={battle.roundsLeft}
              pickedId={battle.pickedId}
              round={battle.round}
              reducedMotion={reducedMotion}
              onPick={battle.pickFilm}
            />
          )}
        {battle.phase === "result" && battle.champion && (
          <WinnerResult
            champion={battle.champion}
            pickedFilms={battle.pickedFilms}
            reducedMotion={reducedMotion}
            shareStatus={winnerShare.status}
            onShare={(film) => void winnerShare.shareWinner(film)}
            onRestart={() => {
              winnerShare.resetShareStatus();
              void battle.loadBattle();
            }}
          />
        )}
      </main>
    </div>
  );
}
