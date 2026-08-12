import { FOCUS_RING } from "@/components/film-detail-actions/styles/focus-ring";

/**
 * Share, deliberately not built like the glyphs beside it.
 *
 * The four before it are all statements about the viewer — seen it, thought this
 * of it. Share sends a link to someone else. Given the same ring and the same
 * 40px as the rating ladder, it read as a fifth verdict sitting on the end of the
 * scale. So it drops the ring, drops to 36px, and takes a wider gap before it:
 * three cues that it belongs to a different category, without a divider rule.
 *
 * It keeps the blurred scrim, because legibility isn't negotiable — these sit
 * over a photographic still and a bare glyph vanishes on a bright frame.
 *
 * The glyph holds the same white/50 as the idle rating glyphs rather than going
 * dimmer. Dimming it read as a fourth way of saying "lesser" and cost real
 * contrast on a control people have to find; shape, size and the gap already
 * carry the distinction, so this one stays at the level the rest of the row
 * uses.
 */
export const SHARE_GLYPH = `flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/25 text-white/50 backdrop-blur-sm transition-colors hover:bg-black/45 hover:text-white ${FOCUS_RING}`;
