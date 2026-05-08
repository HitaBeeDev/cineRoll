import { Router } from "express";
import { filmsRouter } from "./films";
import { pickOfDayRouter } from "./pickOfDay";
import { randomRouter } from "./random";
import { rollRouter } from "./roll";
import { snobTestRouter } from "./snobTest";

export const router = Router();

router.use("/films", filmsRouter);
router.use("/random", randomRouter);
router.use("/roll", rollRouter);
router.use("/pick-of-day", pickOfDayRouter);
router.use("/snob-test", snobTestRouter);
