import { z } from "zod";

import { splitCsvQueryValue } from "./splitCsvQueryValue";

export const excludedFilmIdsParam = z.preprocess(
  splitCsvQueryValue,
  z.array(z.string().min(1).max(180)).max(100),
).optional();
