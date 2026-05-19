import { Router } from "express";
import { autocompleteRouter } from "./autocomplete";
import { filmsRouter } from "./films";
import { marathonRouter } from "./marathon";
import { naturalRollRouter } from "./naturalRoll";
import { personsRouter } from "./persons";
import { pickOfDayRouter } from "./pickOfDay";
import { randomRouter } from "./random";
import { recommendationsRouter } from "./recommendations";
import { rollRouter } from "./roll";
import { snobTestRouter } from "./snobTest";
import { statsRouter } from "./stats";
import { userRouter } from "./user";

export const router = Router();

router.use("/autocomplete", autocompleteRouter);
router.use("/films", filmsRouter);
router.use("/marathon", marathonRouter);
router.use("/natural-roll", naturalRollRouter);
router.use("/persons", personsRouter);
router.use("/random", randomRouter);
router.use("/recommendations", recommendationsRouter);
router.use("/roll", rollRouter);
router.use("/pick-of-day", pickOfDayRouter);
router.use("/snob-test", snobTestRouter);
router.use("/stats", statsRouter);
router.use("/user", userRouter);
