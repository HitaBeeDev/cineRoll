/** Every way into the catalogue, as listed on /about. Keep all of these: /about is a crawl path to them. */
export const WAYS_IN = [
  { href: "/", label: "Roll a random film", note: "One film from the catalogue, chosen at random." },
  { href: "/browse", label: "Browse and filter", note: "By award, year, genre, country or language." },
  { href: "/picks", label: "Today's picks", note: "A fresh set of films every day." },
  { href: "/ask-ai", label: "Ask AI", note: "Describe the mood you are in." },
  { href: "/stats", label: "Records and statistics", note: "The most-awarded films, people and years." },
  {
    href: "/tools",
    label: "Random film tools",
    note: "A random Oscar winner, Palme d'Or winner, or a film by decade, genre or length.",
  },
] as const;
