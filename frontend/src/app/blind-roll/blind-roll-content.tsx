"use client";

import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { BlindRollHeader } from "./blind-roll-header";
import { CaseFile } from "./case-file";
import { CelebrationOverlay } from "./celebration-overlay";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { SuspectLineup } from "./suspect-lineup";
import { useBlindRollGame } from "./use-blind-roll-game";
import { VaultPanel } from "./vault-panel";

export function BlindRollContent() {
  const searchParams = useSearchParams();
  const reduced = useReducedMotion() ?? false;
  const game = useBlindRollGame(searchParams.get("film")?.trim() ?? "");

  return (
    <div className="flex min-h-[calc(100dvh-73px)] flex-col bg-[#09090f] text-[#F5F5F0] lg:h-[calc(100dvh-73px)] lg:min-h-0 lg:overflow-hidden">
      <AppHeader />
      {game.phase === "revealed" && game.correct && <CelebrationOverlay reduced={reduced} />}

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-2 px-4 py-2 sm:px-6 lg:min-h-0 lg:overflow-hidden">
        <BlindRollHeader
          difficulty={game.difficulty}
          sessionScore={game.sessionScore}
          onDifficultyChange={game.changeDifficulty}
        />
        {game.phase === "loading" && <LoadingState />}
        {game.phase === "error" && <ErrorState onRetry={() => void game.loadFilm()} />}
        {game.film && game.phase !== "loading" && game.phase !== "error" && (
          <RoundLayout game={game} reduced={reduced} />
        )}
      </main>
    </div>
  );
}

type RoundLayoutProps = {
  game: ReturnType<typeof useBlindRollGame>;
  reduced: boolean;
};

function RoundLayout({ game, reduced }: RoundLayoutProps) {
  if (!game.film) return null;

  return (
    <div className="relative grid flex-1 items-stretch gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-2 lg:min-h-0">
        <CaseFile
          awards={game.awards}
          awardSummary={game.awardSummary}
          clueCards={game.clueCards}
          expandedAward={game.expandedAward}
          examinedAwards={game.examinedAwards}
          onExamineAward={game.examineAward}
        />
        <SuspectLineup
          film={game.film}
          options={game.options}
          phase={game.phase}
          correct={game.correct}
          selectedFilmId={game.selectedFilmId}
          reduced={reduced}
          onSelect={game.setSelectedFilmId}
        />
      </div>
      <VaultPanel
        film={game.film}
        phase={game.phase}
        correct={game.correct}
        selectedFilm={game.selectedFilm}
        selectedFilmId={game.selectedFilmId}
        examinedCount={game.examinedAwards.size}
        awardCount={game.awards.length}
        shareStatus={game.shareStatus}
        reduced={reduced}
        onReveal={game.reveal}
        onChallengeFriend={() => void game.challengeFriend()}
        onNextFilm={() => void game.loadFilm()}
      />
    </div>
  );
}
