/**
 * The order the card's information arrives in after a roll lands.
 *
 * Variant labels propagate down through the tree, so a nested container (the
 * identity column) runs its own cascade inside the outer one without either
 * knowing about the other. The named labels are the contract: any part of the
 * card that wants a place in the sequence declares `hidden`/`shown` and joins
 * it; anything that sets its own `initial` opts out and keeps its own entrance.
 *
 * Nothing here moves more than 10px. This is a reading order made visible, not
 * an entrance — the card is information, and information that flies in from
 * off-screen is slower to read, not more exciting.
 */
export const CARD_CASCADE = {
  container: {
    hidden: {},
    shown: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
} as const;
