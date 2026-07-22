export const LOCAL_RERANK_WEIGHTS = {
  genreMatch: 4,
  requiredGenreMissing: -100,
  preferredGenreMissing: -2,
  tone: 3,
  theme: 2.5,
  keyword: 2,
  promptToken: 1.5,
  expandedToken: 0.5,
  underrated: 2,
  gore: -5,
} as const;
