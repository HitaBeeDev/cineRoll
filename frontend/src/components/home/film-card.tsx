"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Award,
  Bookmark,
  Eye,
  EyeOff,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useFilmActions } from "@/hooks/useFilmActions";
import { formatRuntime } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { RollFilm } from "@/lib/api";

export function FilmCard({
  film,
  isAuthenticated,
  onNotInterested,
  onGuestHideForSession,
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onNotInterested?: () => void;
  onGuestHideForSession?: (filmId: string) => void;
}) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
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
  } = useFilmActions({
    filmId: film.id,
    filmTitle: film.title,
    isAuthenticated,
    source: "roll_card",
    onNotInterested,
  });

  const channelLabel = `REEL // ${film.title.toUpperCase().slice(0, 11)}`;
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const posterUrl = film.posterUrl;
  const backdropUrl = film.backdropUrl;
  const awardHighlights = getAwardHighlights(film);

  async function shareFilm() {
    const path = `/film/${film.slug}?from=roll`;
    const url = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        variant: "success",
        title: "Link copied!",
        description: path,
      });
    } catch {
      toast({
        variant: "error",
        title: "Could not copy link",
        description: "Copying is not available in this browser.",
      });
    }
  }

  return (
    <div className="flex flex-col lg:h-full">
      {/* Channel pill */}
      <div className="flex items-center -mx-1 -mt-1 mb-2">
        <span className="inline-flex items-center rounded-full border border-[#e8453c]/22 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#e8453c]">
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
              src={backdropUrl}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
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
              trackEvent({
                type: "film_click",
                filmId: film.id,
                context: { source: "roll_card_poster", slug: film.slug },
              });
            }}
            aria-label={`View details for ${film.title}`}
            className="group relative z-20 w-[42%] max-w-[180px] shrink-0 self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
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
                  src={posterUrl}
                  alt={film.title}
                  fill
                  sizes="(max-width: 1024px) 45vw, 200px"
                  className="object-cover"
                  priority
                />
              ) : backdropUrl ? (
                <Image
                  src={backdropUrl}
                  alt={film.title}
                  fill
                  sizes="(max-width: 1024px) 45vw, 200px"
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
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3 lg:flex-1">
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

        {/* Maintenance tier — deliberately demoted below a hairline divider so it
            reads as utility, not as a peer card competing with the result. No
            border/fill: the reward content above owns the focal weight. */}
        <section className="mt-4 border-t border-[#17171f] pt-4 lg:mt-auto">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
              Tune future rolls
            </h3>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#5a5a6a]">
              {isAuthenticated ? "Account signal" : "Session signal"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <QuickActionButton
              tone="confirm"
              active={action === "watched"}
              disabled={pending}
              onClick={() => void saveDecision("watched", false)}
              icon={<Eye className="h-4 w-4" aria-hidden />}
              label="Seen it"
              activeLabel="Seen"
            />
            <QuickActionButton
              tone="dismiss"
              active={action === "not-interested"}
              disabled={pending}
              onClick={() => {
                if (!isAuthenticated) onGuestHideForSession?.(film.id);
                void saveDecision("not-interested", true);
              }}
              icon={<EyeOff className="h-4 w-4" aria-hidden />}
              label="Not for me"
              activeLabel="Hidden"
            />
            <QuickActionButton
              tone="save"
              active={inWatchlist}
              disabled={watchlistPending}
              onClick={() => void toggleWatchlist()}
              icon={
                <Bookmark
                  className="h-4 w-4"
                  fill={inWatchlist ? "currentColor" : "none"}
                  aria-hidden
                />
              }
              label="Save"
              activeLabel="Saved"
            />
          </div>
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8.5px] leading-relaxed tracking-wide text-[#888899]">
            {isAuthenticated
              ? "Saved to your account."
              : "This session only unless you sign in."}
          </p>
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
              "transition-colors hover:border-[#e8453c]/45 hover:text-[#e8453c]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          >
            View details
          </Link>
          <ActionBtn
            aria-label="Share this film"
            title="Share this film"
            onClick={() => void shareFilm()}
          >
            <Share2 className="h-4 w-4" aria-hidden />
          </ActionBtn>
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

function QuickActionButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
  activeLabel,
}: {
  tone: "confirm" | "dismiss" | "save";
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeLabel: string;
}) {
  const toneClasses =
    tone === "confirm"
      ? active
        ? "border-[#3fb950]/45 bg-[#3fb950]/12 text-[#7ee787]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : tone === "dismiss"
        ? active
          ? "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#e8453c]"
          : "border-[#1e1e2a] text-[#888899] hover:border-[#e8453c]/45 hover:text-[#e8453c]"
        : active
          ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
          : "border-[#1e1e2a] text-[#888899] hover:border-[#D4AF37]/45 hover:text-[#D4AF37]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl border",
        "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em]",
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
        ? "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#e8453c]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#e8453c]/45 hover:text-[#e8453c]";

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

function ActionBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 items-center justify-center rounded-xl px-3",
        "border border-[#1e1e2a] text-[#888899]",
        "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
