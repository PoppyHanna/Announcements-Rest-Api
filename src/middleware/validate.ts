import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: z.flattenError(result.error),
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: z.flattenError(result.error),
      });
      return;
    }

    res.locals.validatedParams = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: z.flattenError(result.error),
      });
      return;
    }

    res.locals.validatedQuery = result.data;
    next();
  };
};
