import type { Film } from "@cineroll/types";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import type { StreamingSection } from "./streaming-sections";

export type FilledSection = StreamingSection & { films: Film[]; total: number };

/** How many posters a section shows before linking on to the full list. */
const SECTION_LIMIT = 12;

/**
 * Every section's films under one streaming scope (a service in a country, or
 * any service in a country). Empty sections are dropped — a heading over no
 * films is the thin content these pages must not have.
 */
export async function fetchSectionFilms(
  sections: StreamingSection[],
  scope: Record<string, string>,
): Promise<FilledSection[]> {
  const filled = await Promise.all(
    sections.map(async (section) => {
      const { films, total } = await fetchCollectionFilms({ ...section.params, ...scope }, section.sort, SECTION_LIMIT);
      return { ...section, films, total };
    }),
  );
  return filled.filter((section) => section.total > 0);
}
