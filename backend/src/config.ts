import "dotenv/config";
import { z } from "zod";

const optionalNonEmptyString = z
  .union([z.string().min(1), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(25),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().int().nonnegative().default(100),
  SLOW_REQUEST_THRESHOLD_MS: z.coerce.number().int().nonnegative().default(200),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  // Enrichment-only — not required at runtime
  TMDB_API_KEY: optionalNonEmptyString,
  OMDB_API_KEY: optionalNonEmptyString,
  // Natural language roll — route returns 503 if unset
  GEMINI_API_KEY: optionalNonEmptyString,
  // Ops metrics — /api/metrics returns 503 if unset, else requires this bearer token
  METRICS_TOKEN: optionalNonEmptyString,
  // Feedback notifications — feedback still persists if unset
  RESEND_API_KEY: optionalNonEmptyString,
  OWNER_EMAIL: optionalEmail,
  // Global API rate limiting (per-IP and per-user fixed windows)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_PER_IP: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_MAX_PER_USER: z.coerce.number().int().positive().default(600),
  RATE_LIMIT_DISABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const env = envSchema.parse(process.env);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  databasePoolSize: env.DATABASE_POOL_SIZE,
  slowQueryThresholdMs: env.SLOW_QUERY_THRESHOLD_MS,
  slowRequestThresholdMs: env.SLOW_REQUEST_THRESHOLD_MS,
  frontendUrl: env.FRONTEND_URL,
  tmdbApiKey: env.TMDB_API_KEY ?? "",
  omdbApiKey: env.OMDB_API_KEY ?? "",
  geminiApiKey: env.GEMINI_API_KEY ?? "",
  metricsToken: env.METRICS_TOKEN ?? "",
  resendApiKey: env.RESEND_API_KEY ?? "",
  ownerEmail: env.OWNER_EMAIL ?? "",
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxPerIp: env.RATE_LIMIT_MAX_PER_IP,
    maxPerUser: env.RATE_LIMIT_MAX_PER_USER,
    disabled: env.RATE_LIMIT_DISABLED,
  },
};
