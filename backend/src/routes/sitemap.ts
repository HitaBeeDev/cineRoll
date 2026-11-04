import { Router } from "express";

import { setPublicCache } from "../lib/cache";
import { personSitemapEntries } from "./sitemapRoute/personSitemapEntries";
import {
  findFilmSitemapRows,
  findPersonCreditRows,
  findPersonSlugs,
} from "./sitemapRoute/sitemapRepository";

// A person needs more than one award credit to earn a sitemap slot; single-credit
// pages are thin and would flood the index.
const MIN_PERSON_CREDITS = 2;

export const sitemapRouter = Router();

sitemapRouter.get("/films", async (_req, res) => {
  setPublicCache(res, 86_400);
  res.json(await findFilmSitemapRows());
});

sitemapRouter.get("/persons", async (_req, res) => {
  setPublicCache(res, 86_400);
  const [rows, personSlugs] = await Promise.all([
    findPersonCreditRows(MIN_PERSON_CREDITS),
    findPersonSlugs(),
  ]);
  res.json(personSitemapEntries(rows, personSlugs));
});
