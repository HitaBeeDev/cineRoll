import { z } from "zod";

const parseQueryFlag = (value: unknown): unknown => {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;

  return value;
};

export const queryFlagSchema = z.preprocess(parseQueryFlag, z.boolean());
