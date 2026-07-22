import type { Film } from "@cineroll/types";

import { FALLBACK_ACCENT, SITE_URL } from "./filmOgConfig";
import type { FilmOgViewModel } from "./filmOgTypes";
import { getAwardBadges } from "./mappers/getAwardBadges";
import { getFilmMetaLine } from "./mappers/getFilmMetaLine";
import { getRatings } from "./mappers/getRatings";
import { getTitleSize } from "./mappers/getTitleSize";
import { truncatePlot } from "./mappers/truncatePlot";

export function createFilmOgViewModel(film: Film): FilmOgViewModel {
  return {
    accent: film.posterColor ?? FALLBACK_ACCENT,
    backdropUrl: film.backdropUrl,
    badges: getAwardBadges(film),
    brandLabel: film.isPickOfDay ? "CineRoll · Tonight's Pick" : "CineRoll",
    displayShareUrl: new URL(`/film/${film.slug}`, SITE_URL).toString().replace(/^https?:\/\//, ""),
    metaLine: getFilmMetaLine(film),
    plot: truncatePlot(film.plot),
    posterAlt: `${film.title} poster`,
    posterUrl: film.posterUrl,
    ratings: getRatings(film),
    title: film.title,
    titleSize: getTitleSize(film.title),
  };
}
