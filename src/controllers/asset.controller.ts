import type { Response, NextFunction } from "express";
import assetService from "../services/assetService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class AssetController {
  async createAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const assetData = {
        ...req.body,
        userId: req.user.userId,
      };

      const asset = await assetService.createAsset(assetData);
      sendSuccess(res, "Asset created successfully", { asset }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAssets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string | undefined;

      const result = await assetService.getUserAssets(req.user.userId, page, limit, category);
      sendSuccess(res, "Assets retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const asset = await assetService.getAssetById(id, req.user.userId);
      sendSuccess(res, "Asset retrieved successfully", { asset });
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const asset = await assetService.updateAsset(id, req.user.userId, req.body);
      sendSuccess(res, "Asset updated successfully", { asset });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      await assetService.deleteAsset(id, req.user.userId);
      sendSuccess(res, "Asset deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAssetSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const [totalValue, byCategory] = await Promise.all([
        assetService.getTotalValue(req.user.userId),
        assetService.getAssetsByCategory(req.user.userId),
      ]);

      sendSuccess(res, "Asset summary retrieved successfully", {
        totalValue,
        byCategory,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssetController();

