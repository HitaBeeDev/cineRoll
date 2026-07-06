"use client";

import type { RollFilm } from "@/lib/api";
import { CaseCrackedBanner } from "./case-cracked-banner";
import { ChallengeButton } from "./challenge-button";
import { NextFilmButton } from "./next-film-button";
import { PosterReveal } from "./poster-reveal";
import { RevealedVaultMotion } from "./revealed-vault-motion";
import type { ShareStatus } from "../types";
import { ViewFilmLink } from "./view-film-link";

type RevealedVaultProps = {
  film: RollFilm;
  correct: boolean | null;
  shareStatus: ShareStatus;
  reduced: boolean;
  onChallengeFriend: () => void;
  onNextFilm: () => void;
};

export function RevealedVault({
  film,
  correct,
  shareStatus,
  reduced,
  onChallengeFriend,
  onNextFilm,
}: RevealedVaultProps) {
  return (
    <RevealedVaultMotion reduced={reduced}>
      {correct && <CaseCrackedBanner reduced={reduced} />}
      <PosterReveal film={film} correct={correct} />
      <ViewFilmLink slug={film.slug} />
      <ChallengeButton shareStatus={shareStatus} onClick={onChallengeFriend} />
      <NextFilmButton onClick={onNextFilm} />
    </RevealedVaultMotion>
  );
}
