export type PlaceKind = "countries" | "languages";

/** One country or language page: its URL slug, the API filter value, a name. */
export type Place = { slug: string; value: string; name: string; films: number };
