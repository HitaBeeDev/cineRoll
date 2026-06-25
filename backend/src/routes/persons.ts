import { Router } from "express";

import { personAutocompleteRouter } from "./personsRoute/autocompleteRoutes";
import { personProfileRouter } from "./personsRoute/personRoutes";
import { nameToSlug } from "./personsRoute/slug";

export { nameToSlug };

export const personsRouter = Router();

personsRouter.use(personAutocompleteRouter);
personsRouter.use(personProfileRouter);
