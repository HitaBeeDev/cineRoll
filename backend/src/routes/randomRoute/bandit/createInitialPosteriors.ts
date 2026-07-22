import { PRIOR_POSTERIORS } from "./priorPosteriors";
import type { LanePosteriors } from "./types";

export const createInitialPosteriors = (): LanePosteriors => ({
  safe: { ...PRIOR_POSTERIORS.safe },
  gem: { ...PRIOR_POSTERIORS.gem },
  wild: { ...PRIOR_POSTERIORS.wild },
});
