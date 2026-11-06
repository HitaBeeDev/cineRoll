/** Useful routes through the catalogue, grouped by what a visitor wants to do. */
export const DISCOVERY_PATHS = [
  {
    title: "Find a movie for tonight",
    links: [
      { href: "/tonight", label: "What should I watch tonight?", description: "Pick your country, subscriptions and available time for a film you can stream." },
      { href: "/ask-ai", label: "AI movie recommendations", description: "Describe a mood, theme, era or story and get award-recognised matches." },
      { href: "/picks", label: "Daily movie recommendations", description: "Explore a fresh set of film suggestions across genres and decades." },
      { href: "/moods", label: "Movies by mood", description: "Browse feel-good, romantic, tense, uplifting and other moods before choosing." },
    ],
  },
  {
    title: "Find where to watch a film",
    links: [
      { href: "/streaming", label: "Where to stream award-winning movies", description: "Choose your country to find subscription services carrying award-recognised films." },
      { href: "/browse", label: "Find a movie by title, genre or year", description: "Search the award catalogue, then open a film for its synopsis, cast and streaming options." },
    ],
  },
  {
    title: "Explore film awards and watchlists",
    links: [
      { href: "/awards", label: "Movie award winners and nominees", description: "Browse Oscars, Golden Globes, Cannes and Berlinale results by category and ceremony year." },
      { href: "/collections", label: "Award-winning movie lists", description: "Explore Best Picture winners, festival prizes, cross-award winners and the most awarded films." },
      { href: "/decades", label: "Movies by decade", description: "Find award-recognised classics and more recent films by release decade." },
      { href: "/countries", label: "Movies by country", description: "Explore national cinemas through the films recognised by the four awards." },
      { href: "/languages", label: "Movies by language", description: "Find award-recognised films in the language you want to watch." },
      { href: "/stats", label: "Film award records and statistics", description: "Compare wins, nominations and records across the catalogue." },
    ],
  },
] as const;
