import type { Response } from "express";

export function setPublicCache(res: Response, seconds: number) {
  res.set("Cache-Control", `public, max-age=${seconds}`);
}
