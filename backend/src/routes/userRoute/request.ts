import { Request } from "express";

import { AuthedRequest } from "../../middleware/auth";

export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}
