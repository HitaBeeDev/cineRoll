/**
 * The shared Settings card shell — subtle, and it comes alive on hover (lifts a
 * hair, border warms, a soft shadow appears) so the page feels responsive rather
 * than static. Lives here rather than in the page so the cards that render
 * themselves (avatar, privacy) can't drift from the ones the page wraps.
 */
export const SETTINGS_CARD =
  "group rounded-2xl border border-edge-subtle transition-all duration-300 ease-out " +
  "hover:-translate-y-px hover:border-edge-strong hover:shadow-[0_16px_44px_-28px_rgba(0,0,0,0.9)]";
