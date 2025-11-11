import { Router } from "express";
import authController from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../validators/auth.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  // authRateLimiter,
  // validate(loginSchema),
  authController.login
);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.get(
  "/profile",
  authenticate,
  authController.getProfile
);

export default router;
