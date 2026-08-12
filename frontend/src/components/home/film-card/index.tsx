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
import { ViewDetailsLink } from "@/components/home/film-card/view-details-link";

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
   * to bottom. `split` is for a container with real width — the browse roll
   * panel — where a single column would be a thin ribbon of content down the
   * middle of a wide box, and the whole card two screens tall for no reason.
   *
   * It is one layout, not two stacked: the header band runs the full width with
   * the ratings closing its right edge, and everything under it is evidence in
   * the open column with the controls in a fixed rail beside it. A header that
   * kept to the first third above a body that used all of it read as two
   * different cards glued together, the empty top-right corner being the largest
   * thing on either.
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
  // The page rail itemises the record; the panel does not. The panel shares its
  // height with the results grid below it, and a table of categories and years
  // is reference material — it is what the detail page is for, one click away
  // through View details. What the panel owes the reader is the one line in the
  // header that says why the film is here at all ("1 Oscar win, 4 nominations").
  const recognition = split ? null : getRecognitionRecords(film);

  return (
    // In `column` this is a plain stack and the two children below simply follow
    // each other. In `split` it is the card's one grid: everything about the film
    // in the open cell, everything you can do about it in the rail beside it, and
    // the rail runs the full height rather than starting under the header. Given
    // its own row it was a tall block of buttons next to nothing, and the card
    // ended a hundred-odd pixels below where the film had stopped talking.
    <div
      className={cn(
        "flex flex-col",
        split && "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-4",
      )}
    >
      <div className="flex min-w-0 flex-col">
        {/* In `split` the panel around the card owns the pill: it belongs to the
            header row there, where it stays legible while the card scrolls.
            Printing it here too would state the same tag twice. */}
        {!split && <ChannelPill title={film.title} className="-mx-1 -mt-1 mb-2" />}

        <CardHeader
          film={film}
          posterBlur={posterBlur}
          awardHighlights={awardHighlights}
          onEngage={onEngage}
          compact={split}
          // "2 Oscar nominations" up here and the two nominations themselves a
          // few lines below is the same fact told twice. Where the itemised
          // record is shown, the summary of it is not — which in the panel,
          // where the list is gone, means the summary always.
          showRecognition={recognition === null || recognition.records.length === 0}
          // The ratings close the band on the right: the title and the two
          // numbers people judge it by, on one line of sight. They are also the
          // only thing on the card short enough to sit there without becoming a
          // third column of prose. Below `lg` the band has no room to spare and
          // they fall back to the strip in the evidence column.
          {...(split
            ? {
                aside: (
                  <div className="w-[13rem]">
                    <FilmScores film={film} variant="box" />
                  </div>
                ),
              }
            : {})}
        />

        {/* The evidence: in `column` the full flow, top to bottom, exactly as it
            always has been — plot, scores, the itemised award record. In `split`
            it is the plot and nothing else. */}
        <div
          className={cn("flex min-w-0 flex-col gap-2 px-4 pt-3", split ? "pb-4" : "pb-0")}
        >
          {/* Only where the header band is too narrow to carry the boxes. */}
          {split && (
            <div className="lg:hidden">
              <FilmScores film={film} variant="strip" />
            </div>
          )}

          {/* Five lines in the panel against the rail's three: the plot is the
              only evidence there and the cell is a wide one, so a clamp at four
              stopped mid-thought for no gain. "Read full synopsis" opens the
              rest in place either way. */}
          {film.plot && <FilmSynopsis plot={film.plot} lines={split ? 5 : 3} />}

          {!split && <FilmScores film={film} />}

          {recognition && recognition.records.length > 0 && (
            <RecognizedFor records={recognition.records} more={recognition.more} />
          )}
        </div>
      </div>

      {/* The controls. A rail with a rule down its left in `split` — the film is
          one thing and what you do about it is another, and at this width the
          two need a stated edge between them. In `column` it is simply the rest
          of the card, in the flow. */}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 px-4 pb-4",
          split ? "lg:border-l lg:border-edge-subtle lg:pl-6 lg:pt-3" : "pt-1",
        )}
      >
        {/* The way into the film, at the head of the rail rather than in a
              footer bar under the whole panel — where it was a small pill alone
              in a wide band, a modal's furniture on something that is not a
              modal. Outlined in the accent, not filled with it: the filled
              accent pill on this page is Roll again, directly above, and two of
              them in one colour and shape asked the eye to choose between the
              two things you can do next without telling it which was which. */}
        {split && (
          <ViewDetailsLink
            film={film}
            onEngage={onEngage}
            className={cn(
              "w-full rounded-xl border border-accent bg-accent/10 py-2.5 text-[13px] text-accent-soft",
              "transition-colors duration-200 hover:bg-accent/20 hover:text-fg-hi",
            )}
          />
        )}

        {/* List and share ride with View details as its two utilities — they
              act on the film the same way it does. Under the feedback heading,
              where they used to sit, they were two of six buttons below a line
              that described four of them. */}
        {split && (
          <SecondaryActions
            film={film}
            isAuthenticated={isAuthenticated}
            onEngage={onEngage}
            variant="rail"
          />
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

        {/* In `column` this closes the card: details, list and share, in the
            flow, acting on the film. */}
        {!split && (
          <SecondaryActions film={film} isAuthenticated={isAuthenticated} onEngage={onEngage} />
        )}
      </div>
    </div>
  );
}
