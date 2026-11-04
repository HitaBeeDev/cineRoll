import type { Collection } from "./collection-types";

/**
 * Curated film collections: one fixed films-API query each, shown as a poster
 * grid. Where a prize was renamed over the years, every historical name is
 * listed so the collection is complete (categoryExact matches whole names).
 */
export const COLLECTIONS: Collection[] = [
  {
    slug: "best-picture-winners",
    group: "winners",
    sort: "newest",
    h1: "Every Best Picture Winner",
    title: "Every Oscar Best Picture Winner",
    description:
      "Every film that won the Academy Award for Best Picture, from the first ceremony to today — newest first, with each film's full award history.",
    intro:
      "Every film that won the top prize at the Academy Awards, newest first. Early winners are listed under the category's older names — Outstanding Production and Outstanding Picture — which the Academy used before Best Picture.",
    params: {
      awardBody: "oscar",
      winnerOnly: "true",
      categoryExact:
        "Best Picture,Best Motion Picture,Outstanding Picture,Outstanding Production,Outstanding Motion Picture",
    },
    related: { label: "the Best Picture winners and nominees by year", href: "/awards/oscars/best-picture" },
  },
  {
    slug: "palme-dor-winners",
    group: "winners",
    sort: "newest",
    h1: "Every Palme d'Or Winner",
    title: "Every Palme d'Or Winner",
    description:
      "Every winner of the Palme d'Or, the top prize of the Cannes Film Festival — newest first, with each film's record at the Oscars, Golden Globes and Berlinale.",
    intro:
      "Every feature film that won the Palme d'Or, the highest prize at the Cannes Film Festival, newest first. Short-film Palmes are left out. In some years the jury split the prize, so those years have two winners.",
    params: { awardBody: "cannes", winnerOnly: "true", categoryExact: "Palme d'or" },
    related: { label: "the Palme d'Or winners and nominees by year", href: "/awards/cannes/palme-d-or" },
  },
  {
    slug: "golden-bear-winners",
    group: "winners",
    sort: "newest",
    h1: "Every Golden Bear Winner",
    title: "Every Berlinale Golden Bear Winner",
    description:
      "Every film that won the Golden Bear, the top prize of the Berlin International Film Festival — newest first, with each film's full award history.",
    intro:
      "Every film that won the Golden Bear, the Berlinale's top prize, newest first. Short-film and documentary Golden Bears are left out; this is the main competition award, listed under both of its official names over the years.",
    params: {
      awardBody: "berlin",
      winnerOnly: "true",
      categoryExact: "Golden Bear,Golden Bear for Best Film",
    },
    related: { label: "the Golden Bear winners and nominees by year", href: "/awards/berlinale/golden-bear" },
  },
  {
    slug: "international-feature-winners",
    group: "winners",
    sort: "newest",
    h1: "Every Oscar International Feature Winner",
    title: "Every Oscar International Feature Winner",
    description:
      "Every film that won the Oscar for International Feature Film — formerly Best Foreign Language Film — newest first.",
    intro:
      "Every film that won the Academy Award for International Feature Film, newest first. Until 2019 the award was called Best Foreign Language Film; both names are included here.",
    params: {
      awardBody: "oscar",
      winnerOnly: "true",
      categoryExact: "International Feature Film,Foreign Language Film",
    },
    related: {
      label: "the International Feature winners and nominees by year",
      href: "/awards/oscars/international-feature-film",
    },
  },
  {
    slug: "won-at-two-awards",
    group: "cross-award",
    sort: "wins",
    h1: "Films That Won at Two or More of the Big Four Awards",
    title: "Films That Won at Two or More Major Awards",
    description:
      "Films that won at two or more of the Oscars, the Golden Globes, Cannes and the Berlinale — the rare titles different juries agreed on.",
    intro:
      "Winning at one of the big four awards is an achievement. Winning at two means juries with very different tastes agreed. These are the films that took home a prize at two or more of the Oscars, the Golden Globes, Cannes and the Berlinale, ranked by total wins.",
    params: { minWinningBodies: "2" },
  },
  {
    slug: "won-at-three-awards",
    group: "cross-award",
    sort: "wins",
    h1: "Films That Won at Three of the Big Four Awards",
    title: "Films That Won at Three Major Awards",
    description:
      "The very few films that won at three of the Oscars, the Golden Globes, Cannes and the Berlinale.",
    intro:
      "Only a handful of films have won at three of the four big awards — usually a festival prize in Cannes or Berlin, followed by Oscar and Golden Globe wins the next winter. Here they are, ranked by total wins.",
    params: { minWinningBodies: "3" },
  },
  {
    slug: "won-at-all-four-awards",
    group: "cross-award",
    sort: "wins",
    h1: "Films That Won at All Four Big Awards",
    title: "Films That Won at All Four Major Awards",
    description:
      "Films that won at the Oscars, the Golden Globes, Cannes and the Berlinale — every one of the big four.",
    intro:
      "The rarest list in CineRoll: films that won at the Oscars, the Golden Globes, Cannes and the Berlinale.",
    params: { minWinningBodies: "4" },
  },
  {
    slug: "palme-dor-and-oscar-winners",
    group: "comparison",
    sort: "wins",
    h1: "Films That Won Both the Palme d'Or and an Oscar",
    title: "Palme d'Or Winners That Also Won an Oscar",
    description:
      "Palme d'Or winners that went on to win at least one Academy Award — where Cannes and Hollywood agreed.",
    intro:
      "Cannes and the Academy often disagree. These Palme d'Or winners are the exceptions: the festival's top prize, and at least one Oscar.",
    params: { awardBody: "cannes", winnerOnly: "true", categoryExact: "Palme d'or", wonAtBodies: "oscar" },
    related: { label: "every Palme d'Or winner", href: "/collections/palme-dor-winners" },
  },
  {
    slug: "golden-bear-and-oscar-winners",
    group: "comparison",
    sort: "wins",
    h1: "Films That Won Both the Golden Bear and an Oscar",
    title: "Golden Bear Winners That Also Won an Oscar",
    description:
      "Golden Bear winners from the Berlinale that also won at least one Academy Award.",
    intro:
      "The Berlinale's top prize and the Oscars rarely land on the same film. These Golden Bear winners won at least one Academy Award as well.",
    params: {
      awardBody: "berlin",
      winnerOnly: "true",
      categoryExact: "Golden Bear,Golden Bear for Best Film",
      wonAtBodies: "oscar",
    },
    related: { label: "every Golden Bear winner", href: "/collections/golden-bear-winners" },
  },
  {
    slug: "cannes-and-oscar-winners",
    group: "comparison",
    sort: "wins",
    h1: "Films That Won at Both Cannes and the Oscars",
    title: "Films That Won at Cannes and the Oscars",
    description:
      "Every film that won a prize at the Cannes Film Festival and at the Academy Awards, ranked by total wins.",
    intro:
      "Films that won something at Cannes — any prize, not only the Palme d'Or — and at least one Oscar. It is the clearest overlap between European festival taste and Hollywood's.",
    params: { wonAtBodies: "cannes,oscar" },
  },
  {
    slug: "berlinale-and-oscar-winners",
    group: "comparison",
    sort: "wins",
    h1: "Films That Won at Both the Berlinale and the Oscars",
    title: "Films That Won at the Berlinale and the Oscars",
    description:
      "Every film that won a prize at the Berlin International Film Festival and at the Academy Awards.",
    intro:
      "Films that won at the Berlinale — the Golden Bear, a Silver Bear or another prize — and at least one Oscar, ranked by total wins.",
    params: { wonAtBodies: "berlin,oscar" },
  },
  {
    slug: "golden-globe-and-cannes-winners",
    group: "comparison",
    sort: "wins",
    h1: "Films That Won at Both the Golden Globes and Cannes",
    title: "Films That Won at the Golden Globes and Cannes",
    description:
      "Every film that won a Golden Globe and a prize at the Cannes Film Festival.",
    intro:
      "Films that won at Cannes and at the Golden Globes — a festival prize in May and a Globe the following winter — ranked by total wins.",
    params: { wonAtBodies: "goldenglobe,cannes" },
  },
  {
    slug: "most-awarded-films",
    group: "records",
    sort: "wins",
    h1: "The Most Awarded Films of All Time",
    title: "The Most Awarded Films of All Time",
    description:
      "The films with the most wins across the Oscars, the Golden Globes, Cannes and the Berlinale — the 100 most awarded films ever.",
    intro:
      "The 100 films with the most wins across the four big awards, counted together: every Oscar, Golden Globe, Cannes prize and Berlinale award a film took home.",
    params: {},
  },
  {
    slug: "most-nominated-films",
    group: "records",
    sort: "noms",
    h1: "The Most Nominated Films of All Time",
    title: "The Most Nominated Films of All Time",
    description:
      "The films with the most nominations across the Oscars, the Golden Globes, Cannes and the Berlinale — wins or not.",
    intro:
      "The 100 films nominated the most times across the four big awards, counted together. Some won almost everything they were up for; some are famous for going home empty-handed.",
    params: {},
  },
];
