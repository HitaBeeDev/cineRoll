import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertVerifiedDbSsl } from "@/lib/assert-verified-db-ssl";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Checked before the pool exists, so a connection string that would not verify
  // the server certificate never gets used once.
  assertVerifiedDbSsl(process.env["DATABASE_URL"]);

  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"],
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
