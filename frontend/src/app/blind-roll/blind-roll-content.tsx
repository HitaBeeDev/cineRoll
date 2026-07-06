"use client";

import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { BlindRollHeader } from "./header/blind-roll-header";
import { CelebrationOverlay } from "./effects/celebration-overlay";
import { RoundLayout } from "./round-layout";
import { ErrorState } from "./states/error-state";
import { LoadingState } from "./states/loading-state";
import { useBlindRollGame } from "./use-blind-roll-game";

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
