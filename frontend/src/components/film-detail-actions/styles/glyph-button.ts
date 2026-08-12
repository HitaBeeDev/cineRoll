import { FOCUS_RING } from "@/components/film-detail-actions/styles/focus-ring";

// The hero's tertiary action language: a circular glyph on a hairline ring,
// borrowed from the accolade medallions directly above it so the two read as
// one system. Deliberately 40px against the 48px labelled buttons — the size
// step is what carries the hierarchy, so no divider has to.
//
// The dark blurred scrim is not decoration: these sit over a photographic
// still, and a bare glyph disappears against a bright frame (sand, a white
// horse, a lit face).
export const GLYPH_BUTTON = `flex h-10 w-10 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;
