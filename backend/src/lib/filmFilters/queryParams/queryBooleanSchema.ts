import { z } from "zod";

const parseQueryBoolean = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const normalizedValue = value.toLowerCase();
  if (normalizedValue === "true") return true;
  if (normalizedValue === "false") return false;

  return value;
};

export const queryBooleanSchema = z.preprocess(parseQueryBoolean, z.boolean());
