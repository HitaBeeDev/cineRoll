const AD_TIER_SLUG = /-(?:(?:basic|standard)-)?with-ads$/;

/** `amazon-prime-video-with-ads` → `amazon-prime-video`; null for a plain service slug. */
export function adTierSlugBase(slug: string): string | null {
  const base = slug.replace(AD_TIER_SLUG, "");
  return base !== slug && base.length > 0 ? base : null;
}
