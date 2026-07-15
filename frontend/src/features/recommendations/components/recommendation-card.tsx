"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AUTH_GATE_TITLE, useFilmActions } from "@/hooks/useFilmActions";
import type { RecommendationCardProps } from "../recommendation-component-types";
import { RecommendationCardView } from "./recommendation-card-view";

export function RecommendationCard({
  recommendation,
  onHidden,
}: RecommendationCardProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const actions = useFilmActions({
    filmId: recommendation.id,
    filmTitle: recommendation.title,
    isAuthenticated: status === "authenticated",
    source: "recommendations",
    onNotInterested: onHidden,
  });

  return (
    <>
      <RecommendationCardView
        recommendation={recommendation}
        actions={{
          inWatchlist: actions.inWatchlist,
          watchlistPending: actions.watchlistPending,
          decisionPending: actions.pending,
          onToggleWatchlist: () => void actions.toggleWatchlist(),
          onNotInterested: () =>
            void actions.saveDecision("not-interested", true),
        }}
      />
      <AuthDialog
        open={actions.authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) actions.closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={
          actions.authPrompt ? AUTH_GATE_TITLE[actions.authPrompt] : undefined
        }
      />
    </>
  );
}
