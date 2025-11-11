import type { Response, NextFunction, Request } from "express";
import authService from "../services/authService.js";
import userService from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";
import { SUCCESS_MESSAGES } from "../config/constants.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      sendSuccess(res, SUCCESS_MESSAGES.REGISTER_SUCCESS, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      const result = await authService.login(email, password);

      sendSuccess(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      sendSuccess(res, "Token refreshed successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const user = await userService.getUserById(req.user.userId);
      const userData = user.toObject();
      const { password, ...userWithoutPassword } = userData;

      sendSuccess(res, "Profile retrieved successfully", { user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
