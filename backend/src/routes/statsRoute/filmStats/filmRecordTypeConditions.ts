import { Prisma } from "@prisma/client";

import { contentTypeSql } from "../../../lib/filmFilters/contentTypeSql";
import type { FilmRecordType } from "../types";

const TYPES_COLUMN = Prisma.raw(`"types"`);

// `types` is a multi-valued derived facet; series use the media namespace. The
// per-value rules are shared with the browse facets so the "movie" bucket can't
// mean a feature here and a feature-or-short there.
export const FILM_RECORD_TYPE_CONDITIONS: Record<FilmRecordType, Prisma.Sql> = {
  movie: contentTypeSql(TYPES_COLUMN, "movie"),
  series: Prisma.sql`"contentType" IN ('tv-series', 'tv-mini-series')`,
  documentary: contentTypeSql(TYPES_COLUMN, "documentary"),
  animation: contentTypeSql(TYPES_COLUMN, "animation"),
  short: contentTypeSql(TYPES_COLUMN, "short"),
};
