import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { accountRouter } from "./userRoute/accountRoutes";
import { onboardingRouter } from "./userRoute/onboardingRoutes";
import { ratingsRouter } from "./userRoute/ratingRoutes";
import { statusRouter } from "./userRoute/statusRoutes";
import { watchedRouter } from "./userRoute/watchedRoutes";
import { watchlistRouter } from "./userRoute/watchlistRoutes";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.use(accountRouter);
userRouter.use(onboardingRouter);
userRouter.use(watchlistRouter);
userRouter.use(watchedRouter);
userRouter.use(statusRouter);
userRouter.use(ratingsRouter);
