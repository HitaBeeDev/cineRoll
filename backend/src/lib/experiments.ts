import { createHash } from "crypto";

// Deterministic A/B bucketing. The same actor (userId, or anonId for signed-out
// traffic) always lands in the same variant for a given experiment — no stored
// assignment, no per-request randomness, so client and server agree and buckets
// stay stable across sessions and devices once signed in.

export type Experiment = {
  key: string;
  variants: { name: string; weight: number }[];
};

// The currently live experiment. Weights must sum to 1. Set weights to 0 on a
// variant to ramp it down without changing the bucketing of the others.
export const ACTIVE_EXPERIMENT: Experiment = {
  key: "rec_ranker_v1",
  variants: [
    { name: "control", weight: 0.5 },
    { name: "treatment", weight: 0.5 },
  ],
};

// Map an arbitrary key to a uniform float in [0, 1) via the top 32 bits of a
// SHA-256 digest — uniform spread and no modulo bias.
function hashToUnit(key: string): number {
  const digest = createHash("sha256").update(key).digest();
  return digest.readUInt32BE(0) / 0x1_0000_0000;
}

// Returns the variant tag stamped on events, e.g. "rec_ranker_v1:treatment".
// Unattributed traffic (no actor id) falls into the first variant so it never
// pollutes a treatment arm.
export function assignVariant(
  actorId: string | null | undefined,
  experiment: Experiment = ACTIVE_EXPERIMENT,
): string {
  const variants = experiment.variants;
  if (!actorId) return `${experiment.key}:${variants[0]!.name}`;

  const point = hashToUnit(`${experiment.key}:${actorId}`);
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (point < cumulative) return `${experiment.key}:${variant.name}`;
  }
  return `${experiment.key}:${variants[variants.length - 1]!.name}`;
}

// ── Recommender parameter flags ──────────────────────────────────────────────
//
// The knobs the ranker reads. Baseline is env-overridable (no redeploy to
// retune); each variant layers its own overrides on top. This is the config the
// A/B framework switches per variant.

export type RecommenderParams = {
  qualityWeight: number;
  recencyWeight: number;
  mmrLambda: number;
};

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  const parsed = raw == null ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const BASELINE_PARAMS: RecommenderParams = {
  qualityWeight: envNumber("REC_QUALITY_WEIGHT", 0.8),
  recencyWeight: envNumber("REC_RECENCY_WEIGHT", 0.15),
  mmrLambda: envNumber("REC_MMR_LAMBDA", 0.7),
};

// The single knob this experiment tests. MMR lambda trades relevance (high λ)
// against intra-list diversity (low λ): 1.0 = pure taste-score ordering, 0.0 =
// pure novelty. We hold qualityWeight/recencyWeight fixed and move only λ so any
// metric delta is attributable to the diversity setting alone.
//
// Hypothesis: lowering λ from 0.70 (control) to 0.55 (treatment) widens catalog
// coverage without a meaningful drop in recall@6 / precision@6.
export const EXPERIMENT_KNOB = "mmrLambda" as const;
const CONTROL_MMR_LAMBDA = 0.7; // = BASELINE_PARAMS.mmrLambda default
const TREATMENT_MMR_LAMBDA = 0.55;

// Per-variant overrides keyed by the full variant tag from assignVariant().
// Control intentionally overrides nothing so it tracks the (env-tunable) baseline.
const VARIANT_OVERRIDES: Record<string, Partial<RecommenderParams>> = {
  "rec_ranker_v1:control": {},
  "rec_ranker_v1:treatment": { mmrLambda: TREATMENT_MMR_LAMBDA },
};

// The λ arms the offline A/B sweep evaluates (evalRecommender/abSweep.ts).
export const SWEEP_LAMBDAS = [CONTROL_MMR_LAMBDA, TREATMENT_MMR_LAMBDA] as const;

export function recommenderParams(variant: string): RecommenderParams {
  return { ...BASELINE_PARAMS, ...(VARIANT_OVERRIDES[variant] ?? {}) };
}
