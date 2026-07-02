// Item Response Theory (Rasch / 1-parameter logistic) ability estimation.
//
// The Snob Test shows each user a DIFFERENT randomized 20-film ballot
// (filmRepository.ts samples with RANDOM()), so a raw "seen count" isn't
// comparable across users: seeing 5 obscure films is stronger evidence of
// cinephilia than seeing 5 blockbusters. IRT — the model behind the GRE and
// computerized adaptive testing — puts every user on one latent ability scale
// (theta) regardless of which films they were shown, by weighting each film by
// its difficulty:
//
//     P(seen | theta, b) = sigma(theta - b)            (Rasch / 1PL)
//
// A film is a test "item"; difficulty b is its obscurity. We estimate theta by
// MAP (MLE + a N(0, PRIOR_SD^2) prior) so degenerate ballots (all-seen /
// none-seen) yield a finite, sensible estimate instead of +/- infinity.
//
// Full write-up: docs/algorithms.md §7.

export type BallotItem = {
  difficulty: number; // b, on the logit (log-odds) scale
  seen: boolean; // y in {1, 0}
};

const PRIOR_SD = 1.5; // theta ~ N(0, PRIOR_SD^2); regularizes the MAP fit
const MAX_ITERATIONS = 30;
const CONVERGENCE_EPS = 1e-6;

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

// MAP estimate of latent ability via Newton-Raphson on the penalized
// log-likelihood. Converges in a handful of steps; the prior guarantees a finite
// root even for an all-seen or all-unseen response vector.
export function estimateAbility(items: BallotItem[]): number {
  const priorPrecision = 1 / (PRIOR_SD * PRIOR_SD);
  let theta = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let gradient = -theta * priorPrecision; // d/dtheta of the log-prior
    let information = priorPrecision; // Fisher information + prior precision

    for (const item of items) {
      const p = sigmoid(theta - item.difficulty);
      gradient += (item.seen ? 1 : 0) - p; // score function: sum(y - p)
      information += p * (1 - p);
    }

    const step = gradient / information;
    theta += step;
    if (Math.abs(step) < CONVERGENCE_EPS) break;
  }

  return theta;
}

// The user's rank: fraction of the population prior N(0, PRIOR_SD^2) they beat.
export function abilityPercentile(theta: number): number {
  return normalCdf(theta / PRIOR_SD);
}

// Difficulty b = -logit(p), where p is the base probability an *average* cinephile
// (theta = 0) has seen the film. p is squashed from the same popularity signals
// the ballot query already uses for `knownScore`, so a mainstream Top-250 title
// gets a low (easy) difficulty and an obscure festival winner a high one.
// CENTER/SCALE are cold-start calibration constants — sensible priors now,
// refittable from real ballot data once enough tests accumulate.
const KNOWNNESS_CENTER = 45;
const KNOWNNESS_SCALE = 25;

export type DifficultyFilm = {
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  oscarWins: number;
  ggWins: number;
  cannesWins: number;
  oscarNominations: number;
  ggNominations: number;
  cannesNominations: number;
  posterUrl: string | null;
};

export function filmDifficulty(film: DifficultyFilm): number {
  const topBonus = (rank: number | null) => (rank ? (260 - rank) * 0.55 : 0);
  const knownness =
    (film.imdbRating ?? 0) * 9 +
    topBonus(film.imdbTopMovieRank) +
    topBonus(film.imdbTopTvRank) +
    film.oscarWins * 10 +
    film.ggWins * 7 +
    film.cannesWins * 8 +
    (film.oscarNominations + film.ggNominations + film.cannesNominations) * 1.5 +
    (film.posterUrl ? 8 : 0);

  const p = clamp(sigmoid((knownness - KNOWNNESS_CENTER) / KNOWNNESS_SCALE), 0.02, 0.98);
  return -Math.log(p / (1 - p)); // -logit(p)
}

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

// Abramowitz & Stegun 7.1.26 rational approximation of the standard-normal CDF
// (accurate to ~1e-7) — avoids a stats dependency for one function.
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}
