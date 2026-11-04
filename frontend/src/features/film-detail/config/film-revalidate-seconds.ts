// 90 days. Award data only changes on a seed (and every deploy clears the
// cache anyway), while every rebuild is a backend round-trip that wakes the
// database and spends Vercel free-tier quota — so crawler traffic must hit the cache.
export const FILM_REVALIDATE_SECONDS = 7776000;
