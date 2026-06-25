import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { getValidated, validate } from "../../middleware/validate";
import { autocompletePeople } from "./autocompleteRepository";
import { AutocompleteQuery, autocompleteSchema } from "./schemas";

export const personAutocompleteRouter = Router();

personAutocompleteRouter.get("/autocomplete", validate(autocompleteSchema, "query"), async (req, res) => {
  const { q, limit } = getValidated<AutocompleteQuery>(req, "query");

  setPublicCache(res, 300);
  res.json({ people: await autocompletePeople(q, limit) });
});
