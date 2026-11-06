import type { ToolChoice, ToolDefinition } from "./tool-types";
import { MOODS } from "@/features/moods/moods";

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
    h1: "Random Movie Generator: Roll an Award Winner",
    title: "Random Movie Generator & Movie Roulette",
    description:
      "Try movie roulette: roll a random award-winning movie in one click. CineRoll's movie generator picks from Oscar, Golden Globe, Cannes and Berlinale winners.",
    intro: [
      "Can't decide what to watch? Press the button and get one film that won at the Oscars, the Golden Globes, Cannes or the Berlinale. The pool holds {count} award-winning movies, from 1930s classics to this year's winners.",
      "Think of it as movie roulette: each movie roll gives you one title to consider instead of another list to scroll. Open the film for its synopsis, awards and streaming options, or roll again for another suggestion.",
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
    slug: "random-movie-by-mood",
    name: "Random movie by mood",
    h1: "Random Movie Picker by Mood",
    title: "Random Movie Picker by Mood",
    description:
      "Pick a mood and roll an award-recognised movie: feel-good, romantic, tense, uplifting or dark. Find a film for the evening you want.",
    intro: [
      "Want something uplifting, a tense thriller or a bittersweet story? Choose how you want the evening to feel, then roll a movie from {count} award-recognised films.",
      "Mood describes the feeling of a film rather than its genre: two dramas can leave you in very different places. These tags are assigned automatically, so use them as a guide. Open a pick to read its synopsis before deciding.",
    ],
    params: { contentType: "movie" },
    choices: MOODS.map((mood) => ({ label: mood.name, params: { moodTag: mood.tag } })),
  },
  {
    slug: "random-best-picture-winner",
    name: "Random Best Picture winner",
    h1: "Random Oscar Best Picture Winner",
    title: "Random Oscar Best Picture Winner",
    description:
      "Choose a Best Picture winner to watch at random. Roll from the Academy's top-prize films, then explore the winning movie's awards and streaming options.",
    intro: [
      "Working through the Oscar Best Picture winners? Let a roll choose the next one. This picker draws from {count} films that won the Academy's top award, rather than every film with any Oscar win.",
      "The pool includes the award's earlier names, including Outstanding Production and Outstanding Picture. Read the selected film's synopsis, check where it is streaming and see its full award history before making it your movie for tonight.",
    ],
    params: {
      awardBody: "oscar",
      winnerOnly: "true",
      categoryExact: "Best Picture,Best Motion Picture,Outstanding Picture,Outstanding Production,Outstanding Motion Picture",
    },
  },
  {
    slug: "random-golden-bear-winner",
    name: "Random Golden Bear winner",
    h1: "Random Golden Bear Winner",
    title: "Random Berlinale Golden Bear Winner",
    description:
      "Roll a random Golden Bear winner from the Berlinale's main competition. Discover a Berlin festival film and explore its awards and streaming options.",
    intro: [
      "Explore Berlin festival cinema one film at a time. This roll picks from {count} films that won the Golden Bear in the Berlinale's main competition, including films recorded under Golden Bear for Best Film.",
      "Separate short-film and documentary Golden Bear categories are left out. Each pick links to its Berlinale record alongside any Oscar, Golden Globe or Cannes recognition, so you can follow a festival discovery beyond its first prize.",
    ],
    params: {
      awardBody: "berlin",
      winnerOnly: "true",
      categoryExact: "Golden Bear,Golden Bear for Best Film",
    },
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
