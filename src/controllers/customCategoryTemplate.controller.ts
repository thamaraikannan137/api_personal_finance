import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import customCategoryTemplateService from "../services/customCategoryTemplateService.js";
import { sendSuccess } from "../utils/response.js";
import type { CustomCategoryType } from "../models/CustomCategoryTemplate.js";
import { BadRequestError } from "../utils/errors.js";

class CustomCategoryTemplateController {
  async getTemplates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const typeParam = req.query.type as string | undefined;
      let categoryType: CustomCategoryType | undefined;

      if (typeParam) {
        if (typeParam !== "asset" && typeParam !== "liability") {
          throw new BadRequestError("Invalid category type");
        }
        categoryType = typeParam;
      }

      const templates = await customCategoryTemplateService.getTemplates(
        req.user.userId,
        categoryType
      );

      sendSuccess(res, "Custom categories retrieved successfully", {
        templates,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const template = await customCategoryTemplateService.createTemplate(
        req.user.userId,
        req.body
      );

      sendSuccess(
        res,
        "Custom category created successfully",
        { template },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("Template id is required");
      }

      const template = await customCategoryTemplateService.updateTemplate(
        id,
        req.user.userId,
        req.body
      );

      sendSuccess(res, "Custom category updated successfully", { template });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("Template id is required");
      }

      await customCategoryTemplateService.deleteTemplate(
        id,
        req.user.userId
      );

      sendSuccess(res, "Custom category deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomCategoryTemplateController();


