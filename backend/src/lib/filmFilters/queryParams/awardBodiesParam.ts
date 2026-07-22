import { z } from "zod";

import { AWARD_BODY_VALUES, type AwardBodyValue } from "../constants";

const isAwardBody = (value: string): value is AwardBodyValue =>
  (AWARD_BODY_VALUES as readonly string[]).includes(value);

const parseAwardBodies = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  return value
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(isAwardBody);
};

export const awardBodiesParam = z.preprocess(
  parseAwardBodies,
  z.array(z.enum(AWARD_BODY_VALUES)),
).optional();
