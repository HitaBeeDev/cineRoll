import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { listQuerySchema, ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { getValidated, validate } from "../../middleware/validate";
import { getFacetCounts } from "./facetCounts/getFacetCounts";
import {
  listAwardYears,
  listCategories,
  listCertificates,
  listCountries,
  listGenres,
  listLanguages,
  listReleaseYears,
  listTvTypes,
} from "./facetRepository";

export const facetRouter = Router();

/**
 * Every browse facet's options AND their counts, under the filters passed in —
 * the filtered replacement for the per-facet lists below, which answer the same
 * question for an empty filter set and so can offer combinations that match
 * nothing.
 *
 * Takes the full list query (it is the same filter vocabulary); `sort`, `page`
 * and `limit` are accepted and ignored, since neither ordering nor paging
 * changes what matches.
 */
facetRouter.get("/facets", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  setPublicCache(res, 300);
  res.json(await getFacetCounts(query));
});

facetRouter.get("/certificates", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ certificates: await listCertificates() });
});

facetRouter.get("/languages", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ languages: await listLanguages() });
});

facetRouter.get("/tv-types", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ tvTypes: await listTvTypes() });
});

facetRouter.get("/genres", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ genres: await listGenres() });
});

facetRouter.get("/countries", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ countries: await listCountries() });
});

facetRouter.get("/award-years", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ awardYears: await listAwardYears() });
});

facetRouter.get("/release-years", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ releaseYears: await listReleaseYears() });
});

facetRouter.get("/categories", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ categories: await listCategories() });
});
