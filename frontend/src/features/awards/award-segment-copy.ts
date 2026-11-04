import { fitDescription } from "@/lib/seo/fit-description";
import { fitTitle } from "@/lib/seo/fit-title";
import type { AwardSegment } from "./resolve-award-segment";
import { shortCategoryName } from "./short-category-name";

/** h1, <title> and meta description for each `/awards/{body}/{segment}` page. */
export function awardSegmentCopy(segment: AwardSegment): {
  h1: string;
  title: string;
  description: string;
} {
  if (segment.kind === "year") {
    const { year, shortName, name, films } = segment.data;
    return {
      h1: `${year} ${shortName}: Winners and Nominees`,
      title: `${year} ${shortName} Winners and Nominees`,
      description: fitDescription(`Every winner and nominee at the ${year} ${name} — ${films} films across ${segment.data.categories.length} categories, winners first.`),
    };
  }

  if (segment.kind === "category") {
    const { name, shortName, years } = segment.data;
    const span = `${years.at(-1)?.year}–${years[0]?.year}`;
    return {
      h1: `${name} — Every Winner and Nominee`,
      title: fitTitle(
        `${name} Winners (${shortName}), ${span}`,
        `${name} Winners (${shortName})`,
        `${shortCategoryName(name)} Winners (${shortName})`,
        `${shortCategoryName(name)} Winners`,
      ),
      description: fitDescription(`Every ${shortName} ${name} winner and nominee from ${span}, year by year, with links to each film.`),
    };
  }

  const { name, shortName, films } = segment.data;
  return {
    h1: `Award-Winning ${name} Films at the ${shortName}`,
    title: `${name} Films at the ${shortName}`,
    description: fitDescription(`${films.length} ${name.toLowerCase()} films recognised at the ${shortName}, ranked by wins: winners and nominees with their full award history.`),
  };
}
