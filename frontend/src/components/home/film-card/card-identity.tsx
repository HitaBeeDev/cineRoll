"use client";

import { motion } from "framer-motion";
import { CARD_CASCADE } from "@/components/home/film-card/cascade-motion";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatCreditLabel } from "@/lib/format/format-credit-label";
import { formatFilmLength } from "@/lib/format/format-film-length";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { formatGenres } from "@/lib/format/format-genres";
import { RecognitionSummary } from "@/components/home/film-card/recognition-summary";
import type { AwardHighlight } from "@/components/home/film-card/awards/award-highlight";
import type { RollFilm } from "@/lib/api";

/**
 * The identity column beside the poster: facts strip → title → credit →
 * recognition. Recognition still leads — it's why the film is in CineRoll — but
 * as one line of summary, linking to the categories and years it stands on
 * rather than restating them. Stating both at full size made the first screen of
 * the card mostly award furniture.
 */
export function CardIdentity({
  film,
  awardHighlights,
  compact = false,
  onEngage,
}: {
  film: RollFilm;
  awardHighlights: AwardHighlight[];
  /** Panel sizing — see the title note below. */
  compact?: boolean;
  onEngage?: (() => void) | undefined;
}) {
  // What the title IS — only the surprising kinds (series, short, documentary,
  // animation) get a label; a plain feature film returns "".
  const contentType = formatContentType(film);
  // Year, length and genres are one sentence of fact about the film, so they are
  // one line. Set as two identical rows of spaced capitals they were two labels
  // competing at the same volume, on a card that already carries several — and
  // the eye had to work out that the second row was not a new category of thing
  // but more of the first.
  const meta = [formatFilmYear(film), formatFilmLength(film), formatGenres(film)]
    .filter(Boolean)
    .join(" · ");

  return (
    // A cascade container as well as the identity column: when the card lands
    // after a roll these four blocks arrive in reading order rather than all at
    // once. With no cascade running above it, the labels resolve to nothing and
    // the column renders exactly as it always did.
    <motion.div variants={CARD_CASCADE.container} className="flex min-w-0 flex-1 flex-col gap-2">
      {/* The facts a viewer decides on read as one group above the title. The
          type keeps a border because it names a category; the rest is plain
          text, since a bordered box that does nothing on click reads as a
          broken button. */}
      <motion.div variants={CARD_CASCADE.item} className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {contentType && (
          <span className="rounded-[3px] border border-white/25 bg-white/[0.07] px-2 py-[3px] font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.16em] text-fg">
            {contentType}
          </span>
        )}
        <p className="font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.14em] text-fg-muted">
          {meta}
        </p>
      </motion.div>

      {/* Title — the payoff of the roll, at display scale so it reads as the
          loudest element in the result column. It stays the loudest thing when
          compact too, just not at a size where a two-line title costs 90px of a
          dialog that has ~490px to spend in total. */}
      <motion.h2
        variants={CARD_CASCADE.item}
        className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-fg-hi"
        style={{
          fontSize: compact ? "clamp(1.5rem, 2vw, 2.1rem)" : "clamp(1.85rem, 2.8vw, 2.85rem)",
        }}
      >
        {film.title}
      </motion.h2>

      {/* A person's name is content, not a label, so it is set as a name: normal
          case, at reading size. Only the credit word beside it keeps the spaced
          capitals of the strip above, because that word IS a label. Both in
          capitals, the line was a third shouted row in a column that needs
          somewhere for the eye to rest after the title. */}
      {film.director && (
        <motion.p variants={CARD_CASCADE.item} className="text-[13px] leading-[1.4] text-fg-dim">
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-fg-faint">
            {formatCreditLabel(film)}
          </span>{" "}
          {film.director}
        </motion.p>
      )}

      {awardHighlights.length > 0 && (
        <motion.div variants={CARD_CASCADE.item}>
          <RecognitionSummary
            highlights={awardHighlights}
            slug={film.slug}
            filmId={film.id}
            onEngage={onEngage}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
