import type { ToolChoice, ToolDefinition } from "./tool-types";

const DECADES: ToolChoice[] = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(
  (start) => ({
    label: `${start}s`,
    params: { yearMin: String(start), yearMax: String(start + 9) },
  }),
);

const GENRES: ToolChoice[] = [
  "Drama",
  "Comedy",
  "Romance",
  "Crime",
  "Thriller",
  "Documentary",
  "Animation",
  "War",
  "Action",
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Western",
  "Horror",
  "Music",
].map((genre) => ({
  label: genre === "Science Fiction" ? "Sci-Fi" : genre,
  params: { genre },
}));

export const TOOLS: ToolDefinition[] = [
  {
    slug: "random-award-winning-movie",
    name: "Random award-winning movie",
    h1: "Random Award-Winning Movie Generator",
    title: "Random Award-Winning Movie Generator",
    description:
      "Pick a random award-winning movie in one click. Every film won at the Oscars, Golden Globes, Cannes or the Berlinale — no ads, no endless lists.",
    intro: [
      "Can't decide what to watch? Press the button and get one film that won at the Oscars, the Golden Globes, Cannes or the Berlinale. The pool holds {count} award-winning movies, from 1930s classics to this year's winners.",
      "Every roll is drawn from films with a real award win, not just a nomination, and with solid IMDb and Rotten Tomatoes ratings, so you never land on something nobody liked. Roll again as often as you want — recent picks are kept out so you don't see the same film twice in a row.",
    ],
    params: { contentType: "movie", winnerOnly: "true" },
  },
  {
    slug: "random-oscar-winner",
    name: "Random Oscar winner",
    h1: "Random Oscar Winner Generator",
    title: "Random Oscar Winner Generator",
    description:
      "Roll a random Oscar-winning film. Best Picture winners, acting wins, technical awards and more — one random Academy Award winner at a time.",
    intro: [
      "One click, one Academy Award winner. This roll draws from {count} films that won at least one Oscar — Best Picture winners, films that won for acting, writing, music or craft, documentaries and animated features.",
      "It's a good way out of the usual loop of the same famous titles: you'll get Casablanca one time and a forgotten 1950s gem the next. Each film opens on its full award history, so you can see exactly which Oscars it won and what else it was up for.",
    ],
    params: { awardBody: "oscar", winnerOnly: "true" },
  },
  {
    slug: "random-palme-dor-winner",
    name: "Random Palme d'Or winner",
    h1: "Random Palme d'Or Winner",
    title: "Random Palme d'Or Winner",
    description:
      "Roll a random Palme d'Or winner — the top prize of the Cannes Film Festival. One great festival film to watch tonight, picked for you.",
    intro: [
      "The Palme d'Or is the highest prize at the Cannes Film Festival, and the list of winners is one of the best watchlists in cinema. This roll picks one of the {count} Palme d'Or winners at random.",
      "Expect anything from Italian classics and Japanese masterpieces to recent winners like Parasite. Each film page shows the full Cannes record next to its Oscar, Golden Globe and Berlinale history, so you can see how the festival's choice did elsewhere.",
    ],
    // Exact name: `category` would also match the short-film Palmes.
    params: { awardBody: "cannes", winnerOnly: "true", categoryExact: "Palme d'or" },
  },
  {
    slug: "random-movie-by-decade",
    name: "Random movie by decade",
    h1: "Random Award-Winning Movie by Decade",
    title: "Random Movie by Decade",
    description:
      "Pick a decade — the 1930s to the 2020s — and roll a random award-winning movie from it. Oscar, Golden Globe, Cannes and Berlinale films.",
    intro: [
      "In the mood for a 70s film, or something from the golden age of Hollywood? Pick a decade and roll. Every film here was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale — {count} movies across ten decades.",
      "The decade is the film's release year. Leave it on Any to roll across all of them, or pick one and roll as many times as you like.",
    ],
    params: { contentType: "movie" },
    choices: DECADES,
  },
  {
    slug: "random-movie-by-genre",
    name: "Random movie by genre",
    h1: "Random Award-Winning Movie by Genre",
    title: "Random Movie by Genre",
    description:
      "Choose a genre — drama, comedy, horror, sci-fi, western and more — and get a random award-winning movie from it. One click, one film.",
    intro: [
      "Pick a genre and roll a random award-recognised movie from it: a comedy that won at the Golden Globes, a war film from Cannes, a horror film the Academy noticed. The pool holds {count} movies from the four big awards.",
      "Some genres are rarely rewarded — there are far fewer award-winning horror films than dramas — which makes the ones that are here worth seeking out.",
    ],
    params: { contentType: "movie" },
    choices: GENRES,
  },
  {
    slug: "random-movie-under-90-minutes",
    name: "Random movie under 90 minutes",
    h1: "Random Award-Winning Movie Under 90 Minutes",
    title: "Random Movie Under 90 Minutes",
    description:
      "Short on time? Roll a random award-winning feature film that runs between 60 and 90 minutes. Great films that fit into one evening.",
    intro: [
      "Not every great film needs three hours. This roll picks from {count} award-recognised feature films that run between 60 and 90 minutes — long enough to be a real film, short enough for a weeknight.",
      "Shorts are left out, so every pick is a full feature: tight comedies, documentaries, animated films and classics from the era when 85 minutes was the norm.",
    ],
    params: { contentType: "movie", runtimeMin: "60", runtimeMax: "90" },
  },
];
