import type { Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";
import type { AuthRequest } from "./auth.middleware.js";

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError("User not authenticated");
    }

    if (roles.length > 0 && req.user.role && !roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};
