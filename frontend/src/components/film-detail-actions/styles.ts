const HERO_BUTTON_BASE =
  "flex h-12 items-center border font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-60";

// Secondary action (Watchlist): a solid, clearly-bordered surface — distinctly
// the next-most-important choice after the primary "Watch Trailer", and a step
// above the ghost icon cluster.
export const SECONDARY_BUTTON = `${HERO_BUTTON_BASE} gap-2 px-5`;
export const SECONDARY_IDLE =
  "border-white/30 bg-white/[0.12] text-white hover:border-white/45 hover:bg-white/[0.18]";

// Tertiary, low-intent actions (Watched / Not Interested): ghost icon squares,
// near-invisible until hover so they sit clearly below the labelled buttons.
export const ICON_BUTTON = `${HERO_BUTTON_BASE} w-12 justify-center`;
export const ICON_IDLE =
  "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:bg-white/[0.06] hover:text-white";
