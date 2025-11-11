import type { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import logger from "../config/logger.js";

morgan.token("body", (req: Request) => {
  return JSON.stringify(req.body);
});

export const requestLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);

export const logRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.debug("Incoming Request", {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
  });
  next();
};
