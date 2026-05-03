import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";
type ValidatedData = Partial<Record<RequestPart, unknown>>;

export type ValidatedRequest = Request & {
  validated?: ValidatedData;
};

export function getValidated<T>(req: Request, part: RequestPart): T {
  return ((req as ValidatedRequest).validated?.[part] ?? req[part]) as T;
}

export function validate(schema: ZodSchema, part: RequestPart = "query") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res
        .status(400)
        .json({ error: result.error.message, code: "VALIDATION_ERROR" });
      return;
    }
    const validatedReq = req as ValidatedRequest;
    validatedReq.validated = {
      ...validatedReq.validated,
      [part]: result.data,
    };
    next();
  };
}
