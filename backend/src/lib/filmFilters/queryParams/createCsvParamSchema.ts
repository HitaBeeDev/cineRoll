import { z } from "zod";

import { splitCsvQueryValue } from "./splitCsvQueryValue";

export const createCsvParamSchema = (maximumItemLength: number) =>
  z.preprocess(
    splitCsvQueryValue,
    z.array(z.string().min(1).max(maximumItemLength)),
  ).optional();
