// A week. Award data only changes on a seed, but the film page also shows
// streaming services, which the refresh job re-checks weekly — a longer cache
// would show last month's services. Still long enough that crawler traffic
// hits the cache rather than waking the backend and database.
export const FILM_REVALIDATE_SECONDS = 604800;
