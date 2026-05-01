import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res
        .status(400)
        .json({ error: result.error.message, code: "VALIDATION_ERROR" });
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
