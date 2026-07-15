import type { RollFilm } from "@/lib/api";
import { buildDistanceMatrix } from "./build-distance-matrix";
import { dedupeFilms } from "./dedupe-films";
import { extractFilmFeatures } from "./extract-film-features";
import { findTightestCluster } from "./find-tightest-cluster";
import { shuffleFilms } from "./shuffle-films";

export function buildBattleCluster(
  candidatePool: RollFilm[],
  size: number,
): RollFilm[] {
  const uniqueFilms = dedupeFilms(candidatePool);
  if (uniqueFilms.length <= size) return shuffleFilms(uniqueFilms);

  const features = uniqueFilms.map(extractFilmFeatures);
  const distances = buildDistanceMatrix(features);
  const clusterIndices = findTightestCluster(distances, size);
  return clusterIndices.map((index) => uniqueFilms[index]!);
}
