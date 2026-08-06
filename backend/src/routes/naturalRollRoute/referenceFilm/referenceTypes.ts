import type { SimilaritySourceFilm } from "../../filmsRoute/similaritySourceFilm";

/** A reference film resolved inside the catalogue. Extends the shape the
 *  film-detail similarity builder already consumes, so `buildSimilaritySql`
 *  can be reused as-is rather than reimplemented for this path. */
export type ReferenceFilm = SimilaritySourceFilm & {
  slug: string;
  title: string;
  year: number;
  moodTags: string[];
  keywords: string[];
};

/** Attributes of a film the user named that is NOT in the catalogue, read from
 *  TMDB so the request can still be answered with something honest. */
export type ExternalReference = {
  title: string;
  year: number | null;
  genres: string[];
  keywords: string[];
};

/** What the pipeline learned about the titles a user named.
 *  - `resolved`: the film is in the catalogue; retrieval switches to
 *    nearest-neighbour and `note` explains the anchor.
 *  - `external`: the film exists but has no major award, so it is not in the
 *    catalogue; its attributes become soft preferences and `note` says so.
 *  - `unknown`: the named title could not be identified at all.
 *  - `none`: the user named no reference film. */
export type ReferenceOutcome =
  | { kind: "resolved"; film: ReferenceFilm; note: string }
  | { kind: "external"; reference: ExternalReference; note: string }
  | { kind: "unknown"; requestedTitles: string[]; note: string }
  | { kind: "none" };
