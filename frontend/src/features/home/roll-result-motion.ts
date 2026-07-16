export function buildFadeOutTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.15, ease: "easeIn" as const };
}

export function buildFadeInTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.15, ease: "easeOut" as const };
}

export function buildEmptyStateTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.2, ease: "easeOut" as const };
}
