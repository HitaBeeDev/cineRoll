/**
 * Curated film collections: one fixed films-API query each, shown as a poster
 * grid. Where a prize was renamed over the years, every historical name is
 * listed so the collection is complete (categoryExact matches whole names).
 */
export const COLLECTIONS = [
  {
    slug: "best-picture-winners",
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
    related: { label: "Best Picture winners and nominees by year", href: "/awards/oscars/best-picture" },
  },
  {
    slug: "palme-dor-winners",
    h1: "Every Palme d'Or Winner",
    title: "Every Palme d'Or Winner",
    description:
      "Every winner of the Palme d'Or, the top prize of the Cannes Film Festival — newest first, with each film's record at the Oscars, Golden Globes and Berlinale.",
    intro:
      "Every feature film that won the Palme d'Or, the highest prize at the Cannes Film Festival, newest first. Short-film Palmes are left out. In some years the jury split the prize, so those years have two winners.",
    params: { awardBody: "cannes", winnerOnly: "true", categoryExact: "Palme d'or" },
    related: { label: "Palme d'Or winners and nominees by year", href: "/awards/cannes/palme-d-or" },
  },
  {
    slug: "golden-bear-winners",
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
    related: { label: "Golden Bear winners and nominees by year", href: "/awards/berlinale/golden-bear" },
  },
  {
    slug: "international-feature-winners",
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
      label: "International Feature winners and nominees by year",
      href: "/awards/oscars/international-feature-film",
    },
  },
] as const;
