export function buildFadeInTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.15, ease: "easeOut" as const };
}
