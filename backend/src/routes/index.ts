import { Router } from "express";
import { filmsRouter } from "./films";
import { naturalRollRouter } from "./naturalRoll";
import { pickOfDayRouter } from "./pickOfDay";
import { randomRouter } from "./random";
import { rollRouter } from "./roll";
import { snobTestRouter } from "./snobTest";
import { statsRouter } from "./stats";

export const router = Router();

router.use("/films", filmsRouter);
router.use("/natural-roll", naturalRollRouter);
router.use("/random", randomRouter);
router.use("/roll", rollRouter);
router.use("/pick-of-day", pickOfDayRouter);
router.use("/snob-test", snobTestRouter);
router.use("/stats", statsRouter);
