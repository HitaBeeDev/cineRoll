import type { Film } from "@cineroll/types";
import type { HeroImage } from "./domain-types";

export function getHeroImage(film: Film): HeroImage {
  const isPoster = !film.backdropUrl && film.posterUrl != null;
  return {
    isPoster,
    size: isPoster ? "w780" : "w1280",
    url: film.backdropUrl ?? film.posterUrl,
    scrim: isPoster ? POSTER_SCRIM : BACKDROP_SCRIM,
  };
}

const POSTER_SCRIM = `linear-gradient(105deg, rgba(7,7,11,0.97) 0%, rgba(7,7,11,0.92) 35%, rgba(7,7,11,0.72) 60%, rgba(7,7,11,0.45) 100%),
  radial-gradient(ellipse 70% 80% at 22% 50%, rgba(7,7,11,0.55), transparent 62%)`;

const BACKDROP_SCRIM = `linear-gradient(100deg, rgba(7,7,11,0.94) 0%, rgba(7,7,11,0.80) 26%, rgba(7,7,11,0.38) 52%, rgba(7,7,11,0.02) 80%),
  radial-gradient(ellipse 55% 75% at 16% 50%, rgba(7,7,11,0.42), transparent 60%)`;
