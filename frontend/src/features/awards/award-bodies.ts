/**
 * The four award hubs: URL slug, the names to show, the intro copy for the
 * hub page, and a one-line summary + action label for the /awards cards
 * (kept to similar lengths so the cards scan evenly). Order is listing order.
 */
export const AWARD_BODIES = [
  {
    slug: "oscars",
    shortName: "Oscars",
    name: "Academy Awards",
    headline: "Best Picture",
    summary: "Given in Los Angeles since 1929. Its top prize is Best Picture.",
    explore: "Explore the Oscars",
    intro: [
      "The Academy Awards — the Oscars — are given every year by the Academy of Motion Picture Arts and Sciences in Los Angeles. They have been handed out since 1929 and are the best-known film prizes in the world.",
      "Below is every ceremony and every category in CineRoll's records: who won and who else was nominated, year by year, plus the award-winning films grouped by genre.",
    ],
  },
  {
    slug: "golden-globes",
    shortName: "Golden Globes",
    name: "Golden Globe Awards",
    headline: "Best Motion Picture – Drama",
    summary: "Given since 1944 for film and television, with top prizes for drama and for musical or comedy.",
    explore: "Explore the Golden Globes",
    intro: [
      "The Golden Globes have honoured film and television since 1944. Unlike the Oscars they split the top film prizes in two: drama, and musical or comedy.",
      "Browse every ceremony and category below: winners first, then the other nominees, with links to each film's full award history.",
    ],
  },
  {
    slug: "cannes",
    shortName: "Cannes",
    name: "Cannes Film Festival",
    headline: "Palme d'Or",
    summary: "Held on the French Riviera since 1946. Its top prize is the Palme d'Or.",
    explore: "Explore Cannes",
    intro: [
      "The Cannes Film Festival has been held on the French Riviera since 1946. Its top prize is the Palme d'Or.",
      "Below are the festival's editions and prizes as recorded in CineRoll: the Palme d'Or, the Grand Prix, the acting and directing prizes, and the films selected for the competition.",
    ],
  },
  {
    slug: "berlinale",
    shortName: "Berlinale",
    name: "Berlin International Film Festival",
    headline: "Golden Bear",
    summary: "Held in Berlin since 1951. Its top prize is the Golden Bear.",
    explore: "Explore the Berlinale",
    intro: [
      "The Berlin International Film Festival — the Berlinale — was founded in 1951 and is one of the three big European festivals alongside Cannes and Venice. Its top prize is the Golden Bear; the Silver Bears go to directors, actors and juries' favourites.",
      "Browse every edition and prize below, from the Golden Bear to the short-film and Generation awards.",
    ],
  },
] as const;
