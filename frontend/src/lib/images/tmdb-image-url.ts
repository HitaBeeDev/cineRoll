import type { TmdbImageSize } from "./tmdb-image-size";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

export function tmdbImageUrl(
  src: string | null | undefined,
  size: TmdbImageSize,
): string | null {
  if (!src) return null;
  if (!src.startsWith(TMDB_IMAGE_BASE)) return src;

  const path = src.slice(TMDB_IMAGE_BASE.length).replace(/^[^/]+\//, "");
  return `${TMDB_IMAGE_BASE}${size}/${path}`;
}
