import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { accountRouter } from "./userRoute/accountRoutes";
import { listsRouter } from "./userRoute/listsRoutes";
import { onboardingRouter } from "./userRoute/onboardingRoutes";
import { progressRouter } from "./userRoute/progressRoutes";
import { ratingsRouter } from "./userRoute/ratingRoutes";
import { statusRouter } from "./userRoute/statusRoutes";
import { watchedRouter } from "./userRoute/watchedRoutes";
import { watchlistRouter } from "./userRoute/watchlistRoutes";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.use(accountRouter);
userRouter.use(onboardingRouter);
userRouter.use(progressRouter);
userRouter.use(watchlistRouter);
userRouter.use(listsRouter);
userRouter.use(watchedRouter);
userRouter.use(statusRouter);
userRouter.use(ratingsRouter);
