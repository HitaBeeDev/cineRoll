import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { router } from "./routes";
import { optionalAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimit } from "./middleware/rateLimit";
import { slowRequestLogger } from "./middleware/slowRequestLogger";

export const app = express();

// On Vercel this app is served behind the "/api/backend" service rewrite, which
// forwards the FULL original path (it does not strip the prefix). Re-base every
// request by removing that prefix so routes are defined normally below and still
// work in local dev, where the prefix is absent (the startsWith guard is false).
const SERVICE_PREFIX = "/api/backend";
app.use((req, _res, next) => {
  if (req.url === SERVICE_PREFIX || req.url.startsWith(SERVICE_PREFIX + "/")) {
    req.url = req.url.slice(SERVICE_PREFIX.length) || "/";
  }
  next();
});

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());
app.use(morgan("dev"));
app.use(slowRequestLogger);
app.use(express.json());

// Liveness + readiness: probe the DB so load balancers and uptime checks see a
// 503 when the database is unreachable, instead of a false "healthy" 200.
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "up" });
  } catch {
    res.status(503).json({ ok: false, db: "down" });
  }
});
// Identify the caller (sets req.userId when a valid token is present) so the
// limiter can enforce a per-user budget on top of the per-IP one. Routes keep
// their own requireAuth guard; this pass is best-effort and never rejects.
app.use("/api", optionalAuth, globalRateLimit);
app.use("/api", router);
app.use(errorHandler);
