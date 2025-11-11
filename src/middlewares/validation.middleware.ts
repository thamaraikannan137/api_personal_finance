import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

// Simplified validation middleware - always validates req.body
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map((err: { path: (string | number)[]; message: string }) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError(JSON.stringify(errors));
      }
      
      // Update body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
