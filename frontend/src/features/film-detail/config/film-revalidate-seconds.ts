// A week. Award data only changes on a seed, and every rebuild is a backend
// round-trip that wakes the database — so crawler traffic must hit the cache.
export const FILM_REVALIDATE_SECONDS = 604800;
