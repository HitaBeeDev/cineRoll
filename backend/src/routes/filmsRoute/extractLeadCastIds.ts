import type { SimilaritySourceFilm } from "./similaritySourceFilm";

/**
 * The billed leads only — a shared top-five credit is a real signal that two
 * films belong together; a shared twentieth-billed extra is noise, and matching
 * on the full cast would tie half the catalogue together through character
 * actors. Depth is also what keeps the SQL array small enough to be cheap.
 */
const LEAD_CAST_DEPTH = 5;

type CastMember = { tmdbPersonId: number; order: number };

export const extractLeadCastIds = (film: SimilaritySourceFilm): number[] => {
  if (!Array.isArray(film.cast)) return [];

  const leads = film.cast
    .filter(isCastMember)
    .filter(member => member.order < LEAD_CAST_DEPTH)
    .map(member => member.tmdbPersonId);

  return [...new Set(leads)];
};

const isCastMember = (value: unknown): value is CastMember =>
  typeof value === "object"
  && value !== null
  && "tmdbPersonId" in value
  && typeof value.tmdbPersonId === "number"
  && "order" in value
  && typeof value.order === "number";
