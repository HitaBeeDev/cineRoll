/**
 * The verdict levels the watched API accepts, weakest to strongest. Mirrors the
 * backend's `WatchedSentiment` enum.
 *
 * Defined once here, in the data layer, because this union was previously
 * hand-copied into three files and the copies are what let a new level ship to
 * some screens and not others.
 */
export type FilmSentiment = "dislike" | "like" | "love";
