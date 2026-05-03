import "dotenv/config";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env["PORT"] ?? "4000", 10),
  databaseUrl: required("DATABASE_URL"),
  databasePoolSize: parseInt(process.env["DATABASE_POOL_SIZE"] ?? "25", 10),
  slowQueryThresholdMs: parseInt(process.env["SLOW_QUERY_THRESHOLD_MS"] ?? "100", 10),
  slowRequestThresholdMs: parseInt(process.env["SLOW_REQUEST_THRESHOLD_MS"] ?? "200", 10),
  frontendUrl: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
};
