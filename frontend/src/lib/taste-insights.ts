/**
 * Turns the raw taste profile — three axes in [-1, 1], straight from the backend
 * model — into the human-readable pieces the result screen shows: the "cinematic
 * DNA" bars, the behavioural insight sentences, and the short "why you got this"
 * reasons.
 *
 * Everything here is a pure projection of the same three numbers the archetype
 * match is computed from, so the copy never claims more than the model measured.
 * We deliberately do NOT invent extra dimensions (spectacle, complexity, …):
 * three honest axes beat five fabricated ones.
 *
 * Axis meaning (see backend `filmToVector`):
 *   origin: −1 world cinema … +1 Hollywood
 *   mood:   −1 heavy/serious … +1 light/playful
 *   lane:   −1 festival/arthouse … +1 crowd-pleaser
 */

export interface TasteProfile {
  origin: number;
  mood: number;
  lane: number;
}

type Axis = keyof TasteProfile;
const AXES: Axis[] = ["origin", "mood", "lane"];

/** A bipolar bar: `value` is the lean toward `right` (0 = fully left, 100 = fully right). */
export interface DnaBar {
  key: Axis;
  left: string;
  right: string;
  value: number;
}

const BAR_POLES: Record<Axis, { left: string; right: string }> = {
  origin: { left: "World cinema", right: "Hollywood" },
  mood: { left: "Heavy & serious", right: "Light & playful" },
  lane: { left: "Arthouse", right: "Crowd-pleaser" },
};

/** The three axes as bipolar bars, in a stable display order. */
export function dnaBars(profile: TasteProfile): DnaBar[] {
  return AXES.map((key) => ({
    key,
    ...BAR_POLES[key],
    value: Math.round(((clamp(profile[key]) + 1) / 2) * 100),
  }));
}

// One sentence per pole of each axis, plus a neutral reading for a near-zero
// score. Insights are ordered by how strongly the answers pushed each axis.
const INSIGHTS: Record<Axis, { pos: string; neg: string; mid: string }> = {
  origin: {
    pos: "You gravitate toward English-language, studio-scale storytelling.",
    neg: "You happily cross borders and read subtitles for the right film.",
    mid: "You move easily between Hollywood and world cinema.",
  },
  mood: {
    pos: "You watch to feel lifted — warmth and wit over bleakness.",
    neg: "You lean into heavier, serious films over easy comfort.",
    mid: "You balance heavy drama with lighter fare.",
  },
  lane: {
    pos: "You're drawn to films that become shared cultural experiences.",
    neg: "You seek out the festival and arthouse end, away from the mainstream.",
    mid: "You mix crowd-pleasers with off-the-beaten-path picks.",
  },
};

// Below this magnitude an axis reads as "balanced" rather than a real lean.
const MEANINGFUL = 0.15;

/**
 * Behavioural insight sentences, strongest lean first. Axes the answers barely
 * moved get their neutral reading, so the list always has three honest lines.
 */
export function insights(profile: TasteProfile): string[] {
  return [...AXES]
    .sort((a, b) => Math.abs(profile[b]) - Math.abs(profile[a]))
    .map((axis) => {
      const v = profile[axis];
      if (Math.abs(v) < MEANINGFUL) return INSIGHTS[axis].mid;
      return v > 0 ? INSIGHTS[axis].pos : INSIGHTS[axis].neg;
    });
}

/** A short "why you got this" chip: a label plus a one-line gloss. */
export interface Reason {
  label: string;
  desc: string;
}

const REASONS: Record<Axis, { pos: Reason; neg: Reason }> = {
  origin: {
    pos: { label: "Studio scale", desc: "English-language, big-canvas cinema" },
    neg: { label: "Global stories", desc: "World cinema, subtitles welcome" },
  },
  mood: {
    pos: { label: "Feel-good", desc: "Warm, funny, uplifting" },
    neg: { label: "Serious stakes", desc: "Heavy, dramatic, weighty" },
  },
  lane: {
    pos: { label: "Shared experiences", desc: "Broadly loved crowd-pleasers" },
    neg: { label: "Arthouse edge", desc: "Festival, off the beaten path" },
  },
};

/**
 * The `count` strongest leans as reasons — used both for the "why you got this
 * result" chips and the hero card's "because you value" line. Only axes with a
 * real lean are included, so a perfectly balanced profile yields fewer chips
 * rather than meaningless ones.
 */
export function whyReasons(profile: TasteProfile, count = 3): Reason[] {
  return [...AXES]
    .filter((axis) => Math.abs(profile[axis]) >= MEANINGFUL)
    .sort((a, b) => Math.abs(profile[b]) - Math.abs(profile[a]))
    .slice(0, count)
    .map((axis) => (profile[axis] > 0 ? REASONS[axis].pos : REASONS[axis].neg));
}

function clamp(n: number, lo = -1, hi = 1): number {
  return Math.max(lo, Math.min(hi, n));
}
