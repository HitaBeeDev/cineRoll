import { Router } from "express";

import { filmCommentsRouter } from "./filmsRoute/commentRoutes";
import { filmDetailRouter } from "./filmsRoute/detailRoutes";
import { facetRouter } from "./filmsRoute/facetRoutes";
import { filmListRouter } from "./filmsRoute/listRoutes";
import { peopleRouter } from "./filmsRoute/peopleRoutes";
import { similarFilmsRouter } from "./filmsRoute/similarRoutes";

export const filmsRouter = Router();

filmsRouter.use(facetRouter);
filmsRouter.use(peopleRouter);
filmsRouter.use(filmListRouter);
filmsRouter.use(similarFilmsRouter);
filmsRouter.use(filmCommentsRouter);
filmsRouter.use(filmDetailRouter);
