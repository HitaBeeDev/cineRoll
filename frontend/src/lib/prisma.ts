import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertVerifiedDbSsl } from "@/lib/assert-verified-db-ssl";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Checked before the pool exists, so a connection string that would not verify
  // the server certificate never gets used once.
  assertVerifiedDbSsl(process.env["DATABASE_URL"]);

  // Auth and lists only — a tiny pool per serverless instance, released when
  // idle, so the frontend never competes with the backend for Neon connections.
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"],
    max: 3,
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
