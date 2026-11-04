import { countryPhrase } from "./country-phrase";
import type { PlaceKind } from "./place-types";

/** Wording for country vs language pages, so one template serves both. */
export const PLACE_COPY: Record<
  PlaceKind,
  {
    indexTitle: string;
    indexIntro: string;
    indexDescription: string;
    indexMore: string;
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
    indexDescription:
      "The most awarded films from every country, at the Oscars, the Golden Globes, Cannes and the Berlinale — ranked by wins.",
    indexMore:
      "A country gets a page once at least five of its films have been recognised. Films count for every country that produced them, so a French–Belgian co-production appears under both. Each page shows how many films the country has in the records, which one won the most, and how they did at each of the four awards.",
    crumb: "Countries",
    param: "country",
    h1: (name) => `Award-Winning Films from ${countryPhrase(name)}`,
    title: (name) => `Award-Winning Films from ${countryPhrase(name)}`,
    description: (name) =>
      `The most awarded films from ${countryPhrase(name)} at the Oscars, Golden Globes, Cannes and the Berlinale — ranked by wins.`,
    lead: (name, count) =>
      `${count} films from ${countryPhrase(name)} were recognised at the Oscars, the Golden Globes, Cannes or the Berlinale. A film counts for every country that produced it, so co-productions appear on each of their countries' pages.`,
  },
  languages: {
    indexTitle: "Award-Winning Films by Language",
    indexIntro:
      "Pick a language to see the most awarded films made in it — every film that won or was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale, ranked by wins.",
    indexDescription:
      "The most awarded films in every language, at the Oscars, the Golden Globes, Cannes and the Berlinale — ranked by wins.",
    indexMore:
      "A language gets a page once at least five films in it have been recognised. The language is each film's original spoken language, so a Hollywood film shot in Japanese counts as Japanese. Each page shows how many films there are, which one won the most, and how they did at each of the four awards.",
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
