import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "HTTP_ERROR",
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error | HttpError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.message, code: "VALIDATION_ERROR" });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

  console.error(err);
  res
    .status(500)
    .json({ error: "Internal server error", code: "INTERNAL_ERROR" });
}
