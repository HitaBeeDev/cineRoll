/**
 * The four award hubs: URL slug, the names to show, and the intro copy for the
 * hub page. Order is the order they are listed in.
 */
export const AWARD_BODIES = [
  {
    slug: "oscars",
    shortName: "Oscars",
    name: "Academy Awards",
    headline: "Best Picture",
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
    intro: [
      "The Golden Globes have honoured film and television since 1944. Unlike the Oscars they split the top film prizes in two — drama, and musical or comedy — which is why so many comedies show up here and nowhere else.",
      "Browse every ceremony and category below: winners first, then the other nominees, with links to each film's full award history.",
    ],
  },
  {
    slug: "cannes",
    shortName: "Cannes",
    name: "Cannes Film Festival",
    headline: "Palme d'Or",
    intro: [
      "The Cannes Film Festival has been held on the French Riviera since 1946. Its top prize, the Palme d'Or, is the most coveted award in world cinema, and its competition line-up each May sets the tone for the year in film.",
      "Below are the festival's editions and prizes as recorded in CineRoll: the Palme d'Or, the Grand Prix, the acting and directing prizes, and the films selected for the competition.",
    ],
  },
  {
    slug: "berlinale",
    shortName: "Berlinale",
    name: "Berlin International Film Festival",
    headline: "Golden Bear",
    intro: [
      "The Berlin International Film Festival — the Berlinale — was founded in 1951 and is one of the three big European festivals alongside Cannes and Venice. Its top prize is the Golden Bear; the Silver Bears go to directors, actors and juries' favourites.",
      "Browse every edition and prize below, from the Golden Bear to the short-film and Generation awards.",
    ],
  },
] as const;
