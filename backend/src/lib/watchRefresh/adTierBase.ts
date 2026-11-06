// "Amazon Prime Video with Ads", "Netflix Standard with Ads", "Paramount Plus Basic with Ads".
const AD_TIER = /\s+(?:(?:basic|standard)\s+)?with\s+ads$/i;

/** The service an ad-supported tier belongs to ("Netflix Standard with Ads" → "Netflix"), or null for a plain service. */
export function adTierBase(name: string): string | null {
  const base = name.replace(AD_TIER, "");
  return base !== name && base.length > 0 ? base : null;
}
