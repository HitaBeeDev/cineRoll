import { Router } from "express";
import { z } from "zod";

import { setPublicCache } from "../lib/cache";
import { HttpError } from "../middleware/errorHandler";
import { AWARD_BODIES, isAwardBodySlug, type AwardBodySlug } from "./awardsRoute/awardBodies";
import {
  getAwardBody,
  getAwardCategory,
  getAwardCategoryYear,
  getAwardGenre,
  getAwardYear,
} from "./awardsRoute/awardsService";

const yearParam = z.coerce.number().int().min(1900).max(2100);
const ONE_DAY = 86_400;

function bodyParam(value: string | undefined): AwardBodySlug {
  if (!value || !isAwardBodySlug(value)) {
    throw new HttpError(404, `Unknown award: ${value}`, "AWARD_NOT_FOUND");
  }
  return value;
}

function found<T>(payload: T | null, what: string): T {
  if (!payload) throw new HttpError(404, `${what} has too few films for a page`, "AWARD_PAGE_NOT_FOUND");
  return payload;
}

export const awardsRouter = Router();

awardsRouter.get("/", (_req, res) => {
  setPublicCache(res, ONE_DAY);
  res.json(Object.entries(AWARD_BODIES).map(([slug, body]) => ({ slug, ...body })));
});

awardsRouter.get("/:body", async (req, res) => {
  setPublicCache(res, ONE_DAY);
  res.json(await getAwardBody(bodyParam(req.params.body)));
});

awardsRouter.get("/:body/years/:year", async (req, res) => {
  const body = bodyParam(req.params.body);
  const year = yearParam.parse(req.params.year);
  setPublicCache(res, ONE_DAY);
  res.json(found(await getAwardYear(body, year), `${body} ${year}`));
});

awardsRouter.get("/:body/categories/:category", async (req, res) => {
  const body = bodyParam(req.params.body);
  setPublicCache(res, ONE_DAY);
  res.json(found(await getAwardCategory(body, req.params.category), req.params.category));
});

awardsRouter.get("/:body/categories/:category/:year", async (req, res) => {
  const body = bodyParam(req.params.body);
  const year = yearParam.parse(req.params.year);
  setPublicCache(res, ONE_DAY);
  res.json(
    found(await getAwardCategoryYear(body, req.params.category, year), `${req.params.category} ${year}`),
  );
});

awardsRouter.get("/:body/genres/:genre", async (req, res) => {
  const body = bodyParam(req.params.body);
  setPublicCache(res, ONE_DAY);
  res.json(found(await getAwardGenre(body, req.params.genre), req.params.genre));
});
