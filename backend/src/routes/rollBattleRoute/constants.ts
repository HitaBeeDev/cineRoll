// A Roll Battle bracket is 5 king-of-the-hill rounds, so a single submission can
// carry at most 5 pairwise outcomes. Cap generously to tolerate client changes
// while rejecting abusive payloads.
export const MAX_RESULTS_PER_BATTLE = 10;

// Leaderboard tunables. A film needs a minimum number of duels before it ranks,
// so one lucky win can't top the board; kept low while the dataset is young.
export const LEADERBOARD_DEFAULT_LIMIT = 10;
export const LEADERBOARD_MAX_LIMIT = 50;
export const LEADERBOARD_MIN_GAMES = 3;
