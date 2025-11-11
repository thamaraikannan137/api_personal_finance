import type { RequestHandler } from "express";
import rateLimit, { type Options } from "express-rate-limit";
import env from "../config/env.js";

const rateLimitFactory: (options?: Partial<Options>) => RequestHandler =
  typeof rateLimit === "function"
    ? (rateLimit as (options?: Partial<Options>) => RequestHandler)
    : ((rateLimit as { default: (options?: Partial<Options>) => RequestHandler }).default as (
        options?: Partial<Options>
      ) => RequestHandler);

export const apiRateLimiter = rateLimitFactory({
  windowMs: Number.parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  limit: Number.parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimitFactory({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 requests per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
