import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { router } from "./routes";
import { optionalAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimit } from "./middleware/rateLimit";
import { slowRequestLogger } from "./middleware/slowRequestLogger";

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());
app.use(morgan("dev"));
app.use(slowRequestLogger);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
// Identify the caller (sets req.userId when a valid token is present) so the
// limiter can enforce a per-user budget on top of the per-IP one. Routes keep
// their own requireAuth guard; this pass is best-effort and never rejects.
app.use("/api", optionalAuth, globalRateLimit);
app.use("/api", router);
app.use(errorHandler);
