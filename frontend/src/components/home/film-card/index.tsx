"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useFilmActions } from "@/hooks/useFilmActions";
import { blurDataUrl } from "@/lib/images";
import type { RollFilm } from "@/lib/api";
import { getAwardHighlights, getRecognitionRecords } from "@/components/home/film-card/awards";
import { ChannelPill } from "@/components/home/film-card/channel-pill";
import { CardHeader } from "@/components/home/film-card/card-header";
import { FilmScores } from "@/components/home/film-card/film-scores";
import { RecognizedFor } from "@/components/home/film-card/recognized-for";
import { TuneFutureRolls } from "@/components/home/film-card/tune-future-rolls";
import { SentimentPrompt } from "@/components/home/film-card/sentiment-prompt";
import { SecondaryActions } from "@/components/home/film-card/secondary-actions";

/**
 * The roll result card: composes the verdict header, supporting evidence, and
 * the roll-tuning controls. Holds no presentation of its own beyond layout —
 * card state lives in `useFilmActions`, and each region is its own component.
 */
export function FilmCard({
  film,
  isAuthenticated,
  onNotInterested,
  onNotTonight,
  onWatched,
  onSaved,
  onEngage,
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onNotInterested?: () => void;
  // Session-only "skip this one for now" — rolls onward with a weak, decaying
  // penalty (no account, no permanent hide). The counterpart to onNotInterested.
  onNotTonight?: () => void;
  // Advance to the next roll after "Already seen" succeeds (signed-in only).
  onWatched?: () => void;
  // Advance to the next roll after "Save for later" adds the film (signed-in only).
  onSaved?: () => void;
  // Fired when the user engages with this roll (opens details / saves / marks
  // seen), so reroll learning won't penalize its genre/type. See §6.
  onEngage?: () => void;
}) {
  const pathname = usePathname();
  // The parent keys this card by film.id, so state resets for each new roll.
  const {
    action,
    pending,
    sentiment,
    sentimentDismissed,
    sentimentPending,
    dismissSentiment,
    inWatchlist,
    watchlistPending,
    saveDecision,
    saveSentiment,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({
    filmId: film.id,
    filmTitle: film.title,
    isAuthenticated,
    source: "roll_card",
    onNotInterested,
    onWatched,
    onSaved,
  });

  const posterBlur = blurDataUrl(film.posterColor);
  const awardHighlights = getAwardHighlights(film);
  const recognition = getRecognitionRecords(film);

  return (
    <div className="flex flex-col">
      <ChannelPill title={film.title} />

      <CardHeader
        film={film}
        posterBlur={posterBlur}
        awardHighlights={awardHighlights}
        onEngage={onEngage}
      />

      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        {film.plot && (
          <p className="line-clamp-3 text-xs leading-relaxed text-[#888899]">
            {film.plot}
          </p>
        )}

        <FilmScores film={film} />

        {recognition.records.length > 0 && (
          <RecognizedFor records={recognition.records} more={recognition.more} />
        )}

        <TuneFutureRolls
          isAuthenticated={isAuthenticated}
          onNotTonight={() => onNotTonight?.()}
          onAlreadySeen={() => {
            onEngage?.();
            // doNotSuggest=false → counted as watched (stats, history, archive
            // progress). Watched films are excluded from future rolls regardless,
            // and the 👍/👎 prompt below feeds taste.
            void saveDecision("watched", false);
          }}
          seenActive={action === "watched"}
          onNotInterested={() => void saveDecision("not-interested", true)}
          notInterestedActive={action === "not-interested"}
          actionsPending={pending}
          onSave={() => {
            onEngage?.();
            void toggleWatchlist();
          }}
          savedActive={inWatchlist}
          savePending={watchlistPending}
          authPrompt={authPrompt}
          onCloseAuthPrompt={closeAuthPrompt}
          callbackUrl={pathname}
        />

        {/* One-tap 👍 / 👎 prompt, revealed after a film is marked watched.
            Dismissible and never blocks the rest of the card. */}
        <AnimatePresence initial={false}>
          {action === "watched" && !sentimentDismissed && (
            <SentimentPrompt
              value={sentiment}
              pending={sentimentPending}
              onSelect={(value) => void saveSentiment(value)}
              onDismiss={dismissSentiment}
            />
          )}
        </AnimatePresence>

        <SecondaryActions film={film} isAuthenticated={isAuthenticated} onEngage={onEngage} />
      </div>
    </div>
  );
}
