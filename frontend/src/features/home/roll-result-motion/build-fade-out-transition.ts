export function buildFadeOutTransition(reducedMotion: boolean | null) {
  return { duration: reducedMotion ? 0 : 0.15, ease: "easeIn" as const };
}
