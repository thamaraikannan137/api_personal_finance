import type { Response, NextFunction } from "express";
import liabilityService from "../services/liabilityService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class LiabilityController {
  async createLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const liabilityData = {
        ...req.body,
        userId: req.user.userId,
      };

      const liability = await liabilityService.createLiability(liabilityData);
      sendSuccess(res, "Liability created successfully", { liability }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getLiabilities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string | undefined;

      const result = await liabilityService.getUserLiabilities(req.user.userId, page, limit, category);
      sendSuccess(res, "Liabilities retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getLiabilityById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const liability = await liabilityService.getLiabilityById(id, req.user.userId);
      sendSuccess(res, "Liability retrieved successfully", { liability });
    } catch (error) {
      next(error);
    }
  }

  async updateLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const liability = await liabilityService.updateLiability(id, req.user.userId, req.body);
      sendSuccess(res, "Liability updated successfully", { liability });
    } catch (error) {
      next(error);
    }
  }

  async deleteLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      await liabilityService.deleteLiability(id, req.user.userId);
      sendSuccess(res, "Liability deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getLiabilitySummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const [totalBalance, byCategory] = await Promise.all([
        liabilityService.getTotalBalance(req.user.userId),
        liabilityService.getLiabilitiesByCategory(req.user.userId),
      ]);

      sendSuccess(res, "Liability summary retrieved successfully", {
        totalBalance,
        byCategory,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LiabilityController();

