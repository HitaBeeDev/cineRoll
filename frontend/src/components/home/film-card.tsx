"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Award,
  Bookmark,
  Eye,
  EyeOff,
  Moon,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SharePopover } from "@/components/share-popover";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { useFilmActions, AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { formatFilmLength } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { RollFilm } from "@/lib/api";
import type { AwardRecord } from "@cineroll/types";

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
  const shouldReduceMotion = useReducedMotion();
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

  const channelLabel = `REEL // ${film.title.toUpperCase().slice(0, 11)}`;
  const genre = film.genres[0] ?? "";
  const runtime = formatFilmLength(film);
  const posterUrl = film.posterUrl;
  const backdropUrl = film.backdropUrl;
  const posterBlur = blurDataUrl(film.posterColor);
  const awardHighlights = getAwardHighlights(film);
  const recognition = getRecognitionRecords(film);

  return (
    <div className="flex flex-col">
      {/* Channel pill */}
      <div className="flex items-center -mx-1 -mt-1 mb-2">
        <span className="inline-flex items-center rounded-full border border-[#2a2a3e] bg-[#11111b] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
          {channelLabel}
        </span>
      </div>

      {/* Verdict header — a horizontal composition that fits in one viewport:
          the poster anchors the left as a large 2:3 slab, with the identity
          (meta → title → director → recognition) stacked beside it. The whole
          payoff (poster + title + recognition) is visible at a glance instead of
          stacked into a scroll. A strongly-dimmed blurred backdrop sits behind
          for ambient depth; the big poster dominates it so it recedes. */}
      <div className="relative rounded-xl">
        {/* Ambient backdrop layer — clipped to the rounded box so the blur stays
            inside. Kept separate from the header so a hovered poster can scale
            up and out without being clipped. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          {backdropUrl ? (
            <Image
              src={tmdbImageUrl(backdropUrl, "w780") ?? backdropUrl}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              placeholder="blur"
              blurDataURL={posterBlur}
              className="scale-110 object-cover opacity-25 blur-2xl"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#15151f] to-[#0a0a14]" />
          )}
          <div className="absolute inset-0 bg-[#09090f]/75" />
        </div>

        <div className="relative flex gap-4 p-4">
          {/* Poster anchor (left) — links to the film's detail page. It
              zoom-settles into focus a beat after the card lands, then scales up
              smoothly on hover/focus. Falls back to backdrop, then a placeholder. */}
          <Link
            href={`/film/${film.slug}`}
            onClick={() => {
              onEngage?.();
              trackEvent({
                type: "film_click",
                filmId: film.id,
                context: { source: "roll_card_poster", slug: film.slug },
              });
            }}
            aria-label={`View details for ${film.title}`}
            // self-stretch lets the poster grow to match a tall identity column
            // (long titles) instead of leaving dead space below it; the 2/3
            // aspect ratio acts as the minimum height when the column is short.
            className="group relative z-20 w-[42%] max-w-[180px] shrink-0 self-stretch rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
            style={{ aspectRatio: "2/3" }}
          >
            <motion.div
              className="relative h-full w-full origin-top-left overflow-hidden rounded-lg shadow-[0_16px_44px_rgba(0,0,0,0.6)] ring-1 ring-white/5 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.75)]"
              initial={shouldReduceMotion ? false : { scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              {...(shouldReduceMotion
                ? {}
                : {
                    whileHover: {
                      scale: 1.5,
                      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    },
                  })}
              // One smooth eased tween governs entrance + hover-out so the poster
              // grows and shrinks identically — no springy snap-back.
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
              }
            >
              {posterUrl ? (
                <Image
                  src={tmdbImageUrl(posterUrl, "w500") ?? posterUrl}
                  alt={film.title}
                  fill
                  sizes="(max-width: 1024px) 45vw, 200px"
                  placeholder="blur"
                  blurDataURL={posterBlur}
                  className="object-cover"
                  priority
                />
              ) : backdropUrl ? (
                <Image
                  src={tmdbImageUrl(backdropUrl, "w780") ?? backdropUrl}
                  alt={film.title}
                  fill
                  sizes="(max-width: 1024px) 45vw, 200px"
                  placeholder="blur"
                  blurDataURL={posterBlur}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a18]">
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
                    No image
                  </span>
                </div>
              )}
            </motion.div>
          </Link>

          {/* Identity (right) */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Year · Runtime · Genre */}
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
              {film.year}
              {runtime && ` · ${runtime}`}
              {genre && ` · ${genre}`}
            </p>

            {/* Title — the payoff of the roll, at display scale so it reads as
                the loudest element in the result column. */}
            <h2
              className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-[#F5F5F0]"
              style={{ fontSize: "clamp(1.85rem, 2.8vw, 2.85rem)" }}
            >
              {film.title}
            </h2>

            {/* Director */}
            {film.director && (
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
                Dir. {film.director}
              </p>
            )}

            {/* Recognition — the award record is why this film is in CineRoll at
                all, so it leads beside the identity as the headline credential,
                above the plot and the ratings that merely support it. */}
            {awardHighlights.length > 0 && (
              <AwardsPanel highlights={awardHighlights} />
            )}
          </div>
        </div>
      </div>

      {/* Content below the header */}
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        {/* Plot */}
        {film.plot && (
          <p className="line-clamp-3 text-xs leading-relaxed text-[#888899]">
            {film.plot}
          </p>
        )}

        {/* Score boxes — supporting evidence beneath the award headline. */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <StatBox
            label="IMDb"
            value={film.imdbRating != null ? film.imdbRating.toFixed(1) : "—"}
          />
          <StatBox
            label="RT"
            value={film.rtScore != null ? `${film.rtScore}%` : "—"}
          />
        </div>

        {/* Recognized for — the itemised award record. The header badge gives the
            at-a-glance count; this is the receipts, and it's the film's own data
            earning the space the column would otherwise leave empty. */}
        {recognition.records.length > 0 && (
          <RecognizedFor records={recognition.records} more={recognition.more} />
        )}

        {/* Maintenance tier — deliberately demoted below a hairline divider so it
            reads as utility, not as a peer card competing with the result. No
            border/fill: the reward content above owns the focal weight. */}
        <section className="mt-4 border-t border-[#17171f] pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
              Tune future rolls
            </h3>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#5a5a6a]">
              {isAuthenticated ? "Account signal" : "Session signal"}
            </span>
          </div>
          {/* Four distinct signals, each teaching the roll differently:
              • Not tonight   — session-only weak skip (guest-friendly, no hide)
              • Already seen  — hide + 👍/👎 taste (strong-positive if liked)
              • Not interested — permanent hide + strong session penalty
              • Save for later — watchlist, strong-positive signal */}
          <div className="grid grid-cols-2 gap-2">
            <QuickActionButton
              tone="skip"
              active={false}
              onClick={() => onNotTonight?.()}
              icon={<Moon className="h-4 w-4" aria-hidden />}
              label="Not tonight"
              activeLabel="Not tonight"
            />
            <QuickActionButton
              tone="confirm"
              active={action === "watched"}
              disabled={pending}
              onClick={() => {
                onEngage?.();
                // doNotSuggest=false → counted as watched (stats, history,
                // archive progress). Watched films are excluded from future
                // rolls regardless, and the 👍/👎 prompt below feeds taste.
                void saveDecision("watched", false);
              }}
              icon={<Eye className="h-4 w-4" aria-hidden />}
              label="Already seen"
              activeLabel="Seen"
            />
            <QuickActionButton
              tone="dismiss"
              active={action === "not-interested"}
              disabled={pending}
              onClick={() => void saveDecision("not-interested", true)}
              icon={<EyeOff className="h-4 w-4" aria-hidden />}
              label="Not interested"
              activeLabel="Hidden"
            />
            <QuickActionButton
              tone="save"
              active={inWatchlist}
              disabled={watchlistPending}
              onClick={() => {
                onEngage?.();
                void toggleWatchlist();
              }}
              icon={
                <Bookmark
                  className="h-4 w-4"
                  fill={inWatchlist ? "currentColor" : "none"}
                  aria-hidden
                />
              }
              label="Save for later"
              activeLabel="Saved"
            />
          </div>
          {/* Signed-in status footnote only. Guests get no standing nudge — the
              red sign-in line below appears in its place when they tap an action. */}
          {isAuthenticated && (
            <p className="mt-2.5 flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#6c6c80]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
              Saved to your account
            </p>
          )}

          {/* Guest auth gate: tapping Seen it / Save raises the sign-in modal;
              the action is stashed and replayed when the user returns. */}
          <AuthDialog
            open={authPrompt !== null}
            onOpenChange={(open) => {
              if (!open) closeAuthPrompt();
            }}
            callbackUrl={pathname}
            title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
          />
        </section>

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

        {/* Secondary actions */}
        <div className="flex items-center gap-2 mt-1">
          <Link
            href={`/film/${film.slug}`}
            onClick={() => {
              onEngage?.();
              trackEvent({
                type: "film_click",
                filmId: film.id,
                context: {
                  source: "roll_card",
                  slug: film.slug,
                },
              });
            }}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl py-3",
              "border border-[#2a2a3e] text-[#F5F5F0]",
              "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em]",
              "transition-colors hover:border-[#6a6a85] hover:text-[#F5F5F0]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          >
            View details
          </Link>
          <SaveToListButton
            filmId={film.id}
            filmTitle={film.title}
            isAuthenticated={isAuthenticated}
            iconOnly
            label="Add to list"
            className={cn(
              "flex h-11 items-center justify-center rounded-xl px-3",
              "border border-[#1e1e2a] text-[#888899]",
              "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          />
          <SharePopover
            slug={film.slug}
            title={film.title}
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/film/${film.slug}?from=roll`}
            caption={film.plot ?? undefined}
            triggerAriaLabel="Share this film"
            triggerClassName={cn(
              "flex h-11 items-center justify-center rounded-xl px-3",
              "border border-[#1e1e2a] text-[#888899]",
              "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          >
            <Share2 className="h-4 w-4" aria-hidden />
          </SharePopover>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d1a] px-3 py-2.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-base font-bold text-[#F5F5F0]">
        {value}
      </span>
    </div>
  );
}

type AwardHighlight = {
  label: string;
  wins: number;
  nominations: number;
  rank?: number;
};

function AwardsPanel({ highlights }: { highlights: AwardHighlight[] }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section className="relative mt-auto overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#D4AF37]/[0.07] to-transparent px-3.5 py-3 shadow-[0_0_24px_rgba(212,175,55,0.06)]">
      {/* Landing beat: a single gold sheen sweeps across as the card settles, so
          the moment registers on the differentiator. Fires once per roll (the
          parent keys this card by film.id). */}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"
          initial={{ x: 0 }}
          animate={{ x: "400%" }}
          transition={{ duration: 0.9, delay: 0.28, ease: "easeOut" }}
        />
      )}
      <h3 className="relative flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
        <Award className="h-3.5 w-3.5" aria-hidden />
        Recognition
      </h3>

      {/* Honors ledger: a gold lozenge marks each body the film actually won at;
          wins read gold, nominations recede. Zero-win bodies show noms only. */}
      <ul className="mt-1.5 flex flex-col">
        {highlights.map((item) => {
          const honored = item.wins > 0 || item.rank != null;
          return (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 border-t border-[#17171f] py-2.5 first:border-t-0"
            >
              <span
                className={cn(
                  "flex min-w-0 items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em]",
                  honored ? "text-[#ECE7D6]" : "text-[#8a8a9c]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px]",
                    honored ? "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.55)]" : "bg-[#262634]",
                  )}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.rank != null ? (
                <span className="flex shrink-0 items-baseline gap-1 font-[family-name:var(--font-geist-mono)]">
                  <span className="text-base font-bold leading-none text-[#D4AF37]">#{item.rank}</span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#D4AF37]/60">rank</span>
                </span>
              ) : (
                <span className="flex shrink-0 items-baseline gap-3 font-[family-name:var(--font-geist-mono)]">
                  {item.wins > 0 && (
                    <span className="flex items-baseline gap-1">
                      <span className="text-base font-bold leading-none text-[#D4AF37]">{item.wins}</span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]/65">won</span>
                    </span>
                  )}
                  {item.nominations > 0 && (
                    <span className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-base font-bold leading-none",
                          item.wins > 0 ? "text-[#bdbdca]" : "text-[#F5F5F0]",
                        )}
                      >
                        {item.nominations}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#6c6c80]">nom</span>
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function getAwardHighlights(film: RollFilm): AwardHighlight[] {
  const highlights: AwardHighlight[] = [];
  if (film.oscarWins > 0 || film.oscarNominations > 0) {
    highlights.push({
      label: "Oscars",
      wins: film.oscarWins,
      nominations: film.oscarNominations,
    });
  }
  if (film.ggWins > 0 || film.ggNominations > 0) {
    highlights.push({
      label: "Golden Globes",
      wins: film.ggWins,
      nominations: film.ggNominations,
    });
  }
  if (film.cannesWins > 0 || film.cannesNominations > 0) {
    highlights.push({
      label: "Cannes",
      wins: film.cannesWins,
      nominations: film.cannesNominations,
    });
  }
  if (film.imdbTopMovieRank != null) {
    highlights.push({
      label: "IMDb Top 250 Movies",
      wins: 0,
      nominations: 0,
      rank: film.imdbTopMovieRank,
    });
  }
  if (film.imdbTopTvRank != null) {
    highlights.push({
      label: "IMDb Top 250 TV",
      wins: 0,
      nominations: 0,
      rank: film.imdbTopTvRank,
    });
  }
  return highlights;
}

const RECOGNITION_CAP = 4;

const AWARD_BODY_LABEL: Record<AwardRecord["awardBody"], string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
  berlin: "Berlinale",
};

/** Flatten the per-body category arrays into one wins-first, recent-first ledger.
 *  Capped so the roll card stays scannable; the rest lives on the detail page. */
function getRecognitionRecords(film: RollFilm): {
  records: AwardRecord[];
  more: number;
} {
  const all = [
    ...film.oscarCategories,
    ...film.ggCategories,
    ...film.cannesCategories,
  ].sort((a, b) => Number(b.won) - Number(a.won) || b.awardYear - a.awardYear);
  return {
    records: all.slice(0, RECOGNITION_CAP),
    more: Math.max(0, all.length - RECOGNITION_CAP),
  };
}

function RecognizedFor({
  records,
  more,
}: {
  records: AwardRecord[];
  more: number;
}) {
  return (
    <section className="mt-2">
      <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
        Recognized for
      </h3>
      <ul className="mt-1.5 flex flex-col">
        {records.map((rec, i) => (
          <li
            key={`${rec.awardBody}-${rec.awardYear}-${rec.category}-${i}`}
            className="flex items-center justify-between gap-3 border-t border-[#17171f] py-2 first:border-t-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-xs text-[#cfcfda]">
                {rec.category}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-[#6c6c80]">
                {AWARD_BODY_LABEL[rec.awardBody]} · {rec.awardYear}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.14em]",
                rec.won ? "text-[#D4AF37]" : "text-[#6c6c80]",
              )}
            >
              {rec.won ? "Won" : "Nominated"}
            </span>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-[#6c6c80]">
          +{more} more on the detail page
        </p>
      )}
    </section>
  );
}

function QuickActionButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
  activeLabel,
}: {
  tone: "confirm" | "dismiss" | "save" | "skip";
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeLabel: string;
}) {
  const idle = "border-[#1e1e2a] text-[#888899]";
  const neutralActive = "border-[#46465e] bg-white/[0.06] text-[#F5F5F0]";
  const toneClasses = {
    confirm: active
      ? "border-[#3fb950]/45 bg-[#3fb950]/12 text-[#7ee787]"
      : `${idle} hover:border-[#3fb950]/45 hover:text-[#7ee787]`,
    dismiss: active ? neutralActive : `${idle} hover:border-[#6a6a85] hover:text-[#F5F5F0]`,
    save: active ? neutralActive : `${idle} hover:border-[#6a6a85] hover:text-[#F5F5F0]`,
    // Session-only, low-commitment: a cool, muted hover that doesn't compete
    // with the account-signal actions.
    skip: `${idle} hover:border-[#3a4a6a] hover:text-[#9db4d0]`,
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2",
        "whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.06em]",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
      <span>{active ? activeLabel : label}</span>
    </button>
  );
}

function SentimentPrompt({
  value,
  pending,
  onSelect,
  onDismiss,
}: {
  value: "like" | "dislike" | null;
  pending?: boolean;
  onSelect: (value: "like" | "dislike") => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-3 py-2.5">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#888899]">
          How was it?
        </span>
        <div className="flex items-center gap-2">
          <SentimentButton
            tone="like"
            active={value === "like"}
            disabled={pending}
            onClick={() => onSelect("like")}
            icon={<ThumbsUp className="h-4 w-4" aria-hidden />}
            label="Liked it"
          />
          <SentimentButton
            tone="dislike"
            active={value === "dislike"}
            disabled={pending}
            onClick={() => onSelect("dislike")}
            icon={<ThumbsDown className="h-4 w-4" aria-hidden />}
            label="Disliked it"
          />
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="ml-1 shrink-0 text-[#888899] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SentimentButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  tone: "like" | "dislike";
  active: boolean;
  disabled?: boolean | undefined;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const toneClasses =
    tone === "like"
      ? active
        ? "border-[#3fb950]/45 bg-[#3fb950]/12 text-[#7ee787]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : active
        ? "border-[#46465e] bg-white/[0.06] text-[#F5F5F0]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#6a6a85] hover:text-[#F5F5F0]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}
