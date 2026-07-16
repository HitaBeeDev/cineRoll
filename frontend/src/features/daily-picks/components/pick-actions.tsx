"use client";

import { Bookmark, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ShareButton } from "@/components/share-button";
import { AUTH_GATE_TITLE, useFilmActions } from "@/hooks/useFilmActions";
import { cn } from "@/lib/utils";
import { DAILY_PICKS_SITE_URL } from "../config";
import type { PickActionsProps } from "../component-props";

export function PickActions({ film }: PickActionsProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const actions = useFilmActions({
    filmId: film.id,
    filmTitle: film.title,
    isAuthenticated: status === "authenticated",
    source: "daily_pick",
  });
  const seen = actions.action === "watched";

  return (
    <>
      <button
        type="button"
        aria-pressed={seen}
        aria-label={seen ? "Marked as seen" : "Mark as seen"}
        title={seen ? "Seen — hidden from future picks" : "Mark as seen"}
        disabled={actions.pending}
        onClick={() => void actions.saveDecision("watched", false)}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          seen
            ? "border-white/30 bg-white/15 text-[#F5F5F0]"
            : "border-white/20 text-[#cfcfdc] hover:border-white/40 hover:text-[#F5F5F0]",
        )}
      >
        <Eye className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={actions.inWatchlist}
        aria-label={actions.inWatchlist ? "Saved to watchlist" : "Add to watchlist"}
        disabled={actions.watchlistPending}
        onClick={() => void actions.toggleWatchlist()}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          actions.inWatchlist
            ? "border-white/30 bg-white/15 text-[#F5F5F0]"
            : "border-white/20 text-[#cfcfdc] hover:border-white/40 hover:text-[#F5F5F0]",
        )}
      >
        <Bookmark
          className="h-4 w-4"
          fill={actions.inWatchlist ? "currentColor" : "none"}
          aria-hidden
        />
      </button>
      <ShareButton
        url={`${DAILY_PICKS_SITE_URL}/film/${film.slug}`}
        title={`Watch ${film.title} tonight — CineRoll picked it`}
        label=""
        ariaLabel="Share this pick"
        iconClassName="h-4 w-4"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-[#cfcfdc] transition-colors hover:border-white/40 hover:text-[#F5F5F0]"
      />
      <AuthDialog
        open={actions.authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) actions.closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={actions.authPrompt ? AUTH_GATE_TITLE[actions.authPrompt] : undefined}
      />
    </>
  );
}
