import { z } from "zod";

import { AWARD_BODY_VALUES, AwardBodyValue } from "./constants";

export const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return value;
}, z.boolean());

export const queryFlagSchema = z.preprocess(value => {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;

  return value;
}, z.boolean());

export const csvParam = (max: number) =>
  z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(s => s.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(max)),
    )
    .optional();

export const awardBodiesParam = z
  .preprocess(
    value =>
      typeof value === "string"
        ? value
            .split(",")
            .map(s => s.trim().toLowerCase())
            .filter((s): s is AwardBodyValue => (AWARD_BODY_VALUES as readonly string[]).includes(s))
        : value,
    z.array(z.enum(AWARD_BODY_VALUES)),
  )
  .optional();

export const excludedFilmIdsParam = z
  .preprocess(
    value =>
      typeof value === "string"
        ? value.split(",").map(id => id.trim()).filter(Boolean)
        : value,
    z.array(z.string().min(1).max(180)).max(100),
  )
  .optional();
