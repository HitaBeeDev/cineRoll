import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(25),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().int().nonnegative().default(100),
  SLOW_REQUEST_THRESHOLD_MS: z.coerce.number().int().nonnegative().default(200),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  // Enrichment-only — not required at runtime
  TMDB_API_KEY: z.string().min(1).optional(),
  OMDB_API_KEY: z.string().min(1).optional(),
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
};
