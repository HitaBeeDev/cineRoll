import { Router } from "express";
import { autocompleteRouter } from "./autocomplete";
import { filmsRouter } from "./films";
import { naturalRollRouter } from "./naturalRoll";
import { personsRouter } from "./persons";
import { pickOfDayRouter } from "./pickOfDay";
import { randomRouter } from "./random";
import { rollRouter } from "./roll";
import { snobTestRouter } from "./snobTest";
import { statsRouter } from "./stats";

export const router = Router();

router.use("/autocomplete", autocompleteRouter);
router.use("/films", filmsRouter);
router.use("/natural-roll", naturalRollRouter);
router.use("/persons", personsRouter);
router.use("/random", randomRouter);
router.use("/roll", rollRouter);
router.use("/pick-of-day", pickOfDayRouter);
router.use("/snob-test", snobTestRouter);
router.use("/stats", statsRouter);
