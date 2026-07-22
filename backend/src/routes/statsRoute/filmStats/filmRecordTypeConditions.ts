import { Prisma } from "@prisma/client";

import type { FilmRecordType } from "../types";

// `types` is a multi-valued derived facet; series use the media namespace.
export const FILM_RECORD_TYPE_CONDITIONS: Record<FilmRecordType, Prisma.Sql> = {
  movie: Prisma.sql`"types" @> ARRAY['movie']::TEXT[]`,
  series: Prisma.sql`"contentType" IN ('tv-series', 'tv-mini-series')`,
  documentary: Prisma.sql`"types" @> ARRAY['documentary']::TEXT[]`,
  animation: Prisma.sql`"types" @> ARRAY['animation']::TEXT[]`,
  short: Prisma.sql`"types" @> ARRAY['short']::TEXT[]`,
};
