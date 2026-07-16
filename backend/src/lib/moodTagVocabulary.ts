// Controlled vocabulary for the tag-enrich pipeline (data/scripts/tag-enrich.ts).
// The natural-roll reranker matches extracted soft signals against these tags
// verbatim, so the pipeline constrains Gemini's output to this list — a fixed
// vocabulary keeps matching exact instead of fuzzy. All lowercase; compound
// tags use hyphens so they survive as single strings.

export const MOOD_TAGS = [
  "emotional", "bittersweet", "uplifting", "hopeful", "melancholic", "dark",
  "tense", "nostalgic", "romantic", "feel-good", "heartwarming", "tragic",
  "haunting", "whimsical", "gritty", "dreamy", "warm", "somber", "playful",
  "unsettling",
] as const;

export const THEME_TAGS = [
  "love", "ambition", "dreams", "family", "friendship", "grief", "loss",
  "revenge", "survival", "war", "justice", "identity", "memory", "redemption",
  "sacrifice", "coming-of-age", "obsession", "betrayal", "freedom", "faith",
  "art", "music", "jazz", "dance", "politics", "poverty", "crime", "madness",
  "marriage", "childhood", "immigration", "loneliness",
] as const;

export const STYLE_TAGS = [
  "colorful", "stylized", "minimalist", "black-and-white", "epic", "intimate",
  "atmospheric", "visually-striking", "slow-burn", "character-driven",
  "dialogue-driven", "ensemble", "musical", "poetic", "surreal",
] as const;

export const ENDING_TAGS = [
  "happy-ending", "sad-ending", "bittersweet-ending", "ambiguous-ending",
  "twist-ending",
] as const;

export const ALL_MOOD_TAGS: ReadonlySet<string> = new Set([
  ...MOOD_TAGS,
  ...THEME_TAGS,
  ...STYLE_TAGS,
  ...ENDING_TAGS,
]);
