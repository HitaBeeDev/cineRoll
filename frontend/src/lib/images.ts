const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";
const DEFAULT_BLUR_COLOR = "#11111a";

export type TmdbImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

export function tmdbImageUrl(
  src: string | null | undefined,
  size: TmdbImageSize,
): string | null {
  if (!src) return null;
  if (!src.startsWith(TMDB_IMAGE_BASE)) return src;

  const path = src.slice(TMDB_IMAGE_BASE.length).replace(/^[^/]+\//, "");
  return `${TMDB_IMAGE_BASE}${size}/${path}`;
}

export function blurDataUrl(color: string | null | undefined): string {
  const safeColor = /^#[0-9a-f]{6}$/i.test(color ?? "")
    ? color
    : DEFAULT_BLUR_COLOR;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><rect width="16" height="24" fill="${safeColor}"/><rect width="16" height="24" fill="#09090f" opacity=".34"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
