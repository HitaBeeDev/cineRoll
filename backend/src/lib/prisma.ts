import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config";

function createPrismaClient() {
  // Small pool + short idle timeout: on Vercel every function instance holds its
  // own pool, so 25 per instance exhausted Neon's connection limit (error 53300)
  // after a few instances. Idle connections now close instead of lingering.
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
    max: config.databasePoolSize,
    idleTimeoutMillis: 10_000,
  });
  const client = new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ],
  });

  client.$on("query", event => {
    if (event.duration >= config.slowQueryThresholdMs) {
      console.warn(
        `Slow database query: ${event.duration}ms threshold=${config.slowQueryThresholdMs}ms query=${event.query}`,
      );
    }
  });

  return client;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
