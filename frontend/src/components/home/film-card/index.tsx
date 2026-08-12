"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useFilmActions } from "@/hooks/useFilmActions";
import { cn } from "@/lib/utils/cn";
import { blurDataUrl } from "@/lib/images/blur-data-url";
import type { RollFilm } from "@/lib/api";
import { getAwardHighlights } from "@/components/home/film-card/awards/get-award-highlights";
import { getRecognitionRecords } from "@/components/home/film-card/awards/get-recognition-records";
import { ChannelPill } from "@/components/home/film-card/channel-pill";
import { CardHeader } from "@/components/home/film-card/card-header";
import { FilmScores } from "@/components/home/film-card/film-scores";
import { FilmSynopsis } from "@/components/home/film-card/film-synopsis";
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
  layout = "column",
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
  /**
   * How the material under the header stacks.
   *
   * `column` is the home page's narrow result rail: everything in one file, top
   * to bottom. `split` is for a container with real width — the roll dialog —
   * where a single column would be a thin ribbon of content down the middle of a
   * wide box, and the whole card two screens tall for no reason. It puts the
   * evidence (plot, scores, what it was recognised for) beside the controls
   * (tune, then the detail/list/share row) instead of above them, which is close
   * to halving the height at no cost to either.
   */
  layout?: "column" | "split";
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

  const split = layout === "split";
  const posterBlur = blurDataUrl(film.posterColor);
  const awardHighlights = getAwardHighlights(film);
  // Two rows in the dialog, four in the page rail. The dialog's height is fixed
  // and shared with the controls beside it, so rows five and six are paid for in
  // scrolling; the count they'd have shown still reaches the reader via "+N more".
  const recognition = getRecognitionRecords(film, split ? 2 : undefined);

  return (
    <div className="flex flex-col">
      {/* In `split` the dialog around the card owns the pill: it belongs to the
          sticky header there, where it stays legible after the hero scrolls
          away. Printing it here too would state the same tag twice. */}
      {!split && <ChannelPill title={film.title} className="-mx-1 -mt-1 mb-2" />}

      <CardHeader
        film={film}
        posterBlur={posterBlur}
        awardHighlights={awardHighlights}
        onEngage={onEngage}
        compact={split}
        // "2 Oscar nominations" up here and the two nominations themselves a few
        // lines below is the same fact told twice. Where the itemised record is
        // shown, the summary of it is not.
        showRecognition={!split || recognition.records.length === 0}
      />

      {/* In `column` everything sits in one flow, top to bottom, exactly as it
          always has.

          In `split` it is evidence left, controls right — with the scores lifted
          out of the right column and set as a strip under the header, where they
          belong to the film rather than to the buttons. As a pair of tall boxes
          at the foot of the controls they were the second-largest object on the
          card for two numbers, and they anchored a column that should read as
          the quietest thing here. */}
      <div
        className={cn(
          "px-4 pb-4 pt-3",
          split ? "grid gap-x-6 gap-y-3 sm:grid-cols-2" : "flex flex-col gap-2",
        )}
      >
        <div className="flex min-w-0 flex-col gap-2">
          {split && <FilmScores film={film} variant="strip" />}

          {/* Four lines in the dialog against the rail's three: enough to place
              the story, short of the six that pushed everything below it out of
              the box. "Read full synopsis" opens the rest in place either way. */}
          {film.plot && <FilmSynopsis plot={film.plot} lines={split ? 4 : 3} />}

          {!split && <FilmScores film={film} />}

          {recognition.records.length > 0 && (
            <RecognizedFor records={recognition.records} more={recognition.more} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <TuneFutureRolls
            isAuthenticated={isAuthenticated}
            // Its rule separates it from the plot above in one column. Beside
            // that plot it would be a line starting halfway across the card,
            // pointing at nothing.
            flush={split}
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

          {/* In `split`, list and share close the controls column instead of
              floating as two unlabelled icons in the empty band under the
              evidence, a screen's width from anything they act on. Labelled,
              because a bookmark glyph alone does not say which of "save",
              "list" and "watchlist" it is. */}
          {split && (
            <SecondaryActions
              film={film}
              isAuthenticated={isAuthenticated}
              onEngage={onEngage}
              showViewDetails={false}
              showLabels
            />
          )}
        </div>

        {/* In `column` it is the card's own footer: details, list and share, in
            the flow, acting on the film. */}
        {!split && (
          <SecondaryActions film={film} isAuthenticated={isAuthenticated} onEngage={onEngage} />
        )}
      </div>
    </div>
  );
}
