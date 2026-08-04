export function buildEmptyStateTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.2, ease: "easeOut" as const };
}
