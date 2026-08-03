import { Router } from "express";

import { listQuerySchema, ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { isViewerScoped } from "../../lib/filmFilters/viewerPredicates";
import { setPublicCache } from "../../lib/cache";
import { optionalAuth, type OptionallyAuthedRequest } from "../../middleware/auth";
import { getValidated, validate } from "../../middleware/validate";
import { getFilmList } from "./listRepository";

export const filmListRouter = Router();

/**
 * `optionalAuth` rather than `requireAuth`: browse is public, and the token only
 * decides whether the per-viewer filters (currently "hide what I've watched")
 * can do anything. A signed-out request is served exactly as before.
 */
filmListRouter.get("/", optionalAuth, validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const viewerId = (req as OptionallyAuthedRequest).userId;
  const payload = await getFilmList(query, viewerId);

  // A viewer-scoped response must never enter a shared cache: the same URL
  // resolves to a different set of films per person, so caching it publicly
  // would serve one user's filtered browse to the next.
  if (isViewerScoped(query, viewerId)) {
    res.set("Cache-Control", "private, no-store");
  } else if (query.sample !== "onboarding") {
    setPublicCache(res, 300);
  }

  res.json(payload);
});
