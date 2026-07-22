import { Prisma } from "@prisma/client";
import { Request } from "express";

import { AuthedRequest } from "../../middleware/auth";

export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
