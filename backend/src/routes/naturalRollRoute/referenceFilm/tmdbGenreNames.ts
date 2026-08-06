// TMDB's movie genre ids. Hardcoded rather than fetched: the list is stable,
// and spending a network round-trip per request to learn that 28 means "Action"
// is not worth it. The names match the catalogue's own genre vocabulary because
// the enrichment pipeline sources genres from this same TMDB list.
const TMDB_GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const tmdbGenreNames = (ids: number[]): string[] =>
  ids.map(id => TMDB_GENRE_NAMES[id]).filter((name): name is string => name !== undefined);
