import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import {
  listAwardYears,
  listCategories,
  listCertificates,
  listCountries,
  listGenres,
  listLanguages,
  listTvTypes,
} from "./facetRepository";

export const facetRouter = Router();

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

facetRouter.get("/categories", async (_req, res) => {
  setPublicCache(res, 3600);
  res.json({ categories: await listCategories() });
});
