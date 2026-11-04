// A teaser lineup for the idle "standby" ticker — iconic Oscar/Cannes/Globe
// winners, so the panel previews the kind of films in the reel before the
// first roll. Static + curated (no fetch) on purpose. Each title links to its
// film page: the home page's only server-rendered links into the catalogue.
// Slugs verified against the live catalogue on 2026-11-04.
export const STANDBY_LINEUP = [
  { title: "Parasite", slug: "parasite-2019" },
  { title: "The Godfather", slug: "the-godfather-1972" },
  { title: "Casablanca", slug: "casablanca-1943" },
  { title: "Pulp Fiction", slug: "pulp-fiction-1994" },
  { title: "Moonlight", slug: "moonlight-2016" },
  { title: "Apocalypse Now", slug: "apocalypse-now-1979" },
  { title: "La Dolce Vita", slug: "la-dolce-vita-1960" },
  { title: "No Country for Old Men", slug: "no-country-for-old-men-2007" },
  { title: "All About Eve", slug: "all-about-eve-1950" },
  { title: "In the Mood for Love", slug: "in-the-mood-for-love-2000" },
  { title: "Amour", slug: "amour-2012" },
  { title: "Nomadland", slug: "nomadland-2021" },
] as const;
