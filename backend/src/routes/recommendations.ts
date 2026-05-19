import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);
