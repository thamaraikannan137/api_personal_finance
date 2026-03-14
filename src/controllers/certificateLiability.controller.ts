import type { Response, NextFunction } from "express";
import certificateLiabilityService from "../services/certificateLiabilityService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class CertificateLiabilityController {
  async getLiabilities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await certificateLiabilityService.getByCertificate(req.params.certificateId as string);
      sendSuccess(res, "Liabilities retrieved successfully", { liabilities: doc });
    } catch (error) {
      next(error);
    }
  }

  async saveAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await certificateLiabilityService.saveAll(
        req.params.certificateId as string,
        req.body.items ?? []
      );
      sendSuccess(res, "Liabilities saved successfully", { liabilities: doc });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await certificateLiabilityService.addItem(req.params.certificateId as string, req.body);
      sendSuccess(res, "Liability item added successfully", { liabilities: doc }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await certificateLiabilityService.updateItem(
        req.params.certificateId as string,
        req.params.itemId as string,
        req.body
      );
      sendSuccess(res, "Liability item updated successfully", { liabilities: doc });
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await certificateLiabilityService.deleteItem(
        req.params.certificateId as string,
        req.params.itemId as string
      );
      sendSuccess(res, "Liability item deleted successfully", { liabilities: doc });
    } catch (error) {
      next(error);
    }
  }
}

export default new CertificateLiabilityController();
