/**
 * The session's impressed-film ids, boxed: two modules replace this cache, and
 * an imported binding cannot be assigned — only a property of one can.
 */
export const cachedFilmIds: { value: Set<string> | null } = { value: null };
