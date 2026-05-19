import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const userRouter = Router();

userRouter.use(requireAuth);
