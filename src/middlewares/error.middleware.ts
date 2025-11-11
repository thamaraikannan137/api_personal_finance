import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import logger from "../config/logger.js";
import { HTTP_STATUS } from "../config/constants.js";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Check if it's an operational error (expected application error)
  if (err instanceof AppError && err.isOperational) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    return sendError(res, err.message, err.statusCode);
  }

  // Programming or unexpected errors - log full details but hide from client
  logger.error(`Unexpected Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    name: err.name,
  });

  // Don't expose internal error details to client in production
  const errorMessage = 
    process.env.NODE_ENV === "production" 
      ? "An unexpected error occurred" 
      : err.message;

  return sendError(
    res,
    "An unexpected error occurred",
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorMessage
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return sendError(res, `Route ${req.path} not found`, HTTP_STATUS.NOT_FOUND);
};
