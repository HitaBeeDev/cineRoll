import type { PlaceKind } from "./place-types";

/** Wording for country vs language pages, so one template serves both. */
export const PLACE_COPY: Record<
  PlaceKind,
  {
    indexTitle: string;
    indexIntro: string;
    crumb: string;
    param: "country" | "language";
    h1: (name: string) => string;
    title: (name: string) => string;
    description: (name: string) => string;
    lead: (name: string, count: string) => string;
  }
> = {
  countries: {
    indexTitle: "Award-Winning Films by Country",
    indexIntro:
      "Pick a country to see its most awarded films — every film from there that won or was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale, ranked by wins.",
    crumb: "Countries",
    param: "country",
    h1: (name) => `Award-Winning Films from ${name}`,
    title: (name) => `Award-Winning Films from ${name}`,
    description: (name) =>
      `The most awarded films from ${name} at the Oscars, Golden Globes, Cannes and the Berlinale — ranked by wins.`,
    lead: (name, count) =>
      `${count} films from ${name} were recognised at the Oscars, the Golden Globes, Cannes or the Berlinale. A film counts for every country that produced it, so co-productions appear on each of their countries' pages.`,
  },
  languages: {
    indexTitle: "Award-Winning Films by Language",
    indexIntro:
      "Pick a language to see the most awarded films made in it — every film that won or was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale, ranked by wins.",
    crumb: "Languages",
    param: "language",
    h1: (name) => `Award-Winning ${name}-Language Films`,
    title: (name) => `Award-Winning ${name}-Language Films`,
    description: (name) =>
      `The most awarded films in ${name} at the Oscars, Golden Globes, Cannes and the Berlinale — ranked by wins.`,
    lead: (name, count) =>
      `${count} films in ${name} were recognised at the Oscars, the Golden Globes, Cannes or the Berlinale. The language is each film's original spoken language.`,
  },
};
