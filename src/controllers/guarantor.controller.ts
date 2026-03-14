import type { Response, NextFunction } from "express";
import guarantorService from "../services/guarantorService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class GuarantorController {
  async getGuarantors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await guarantorService.getByCertificate(req.params.certificateId as string);
      sendSuccess(res, "Guarantor details retrieved successfully", { guarantors: doc });
    } catch (error) {
      next(error);
    }
  }

  async saveAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await guarantorService.saveAll(req.params.certificateId as string, req.body.items ?? []);
      sendSuccess(res, "Guarantor details saved successfully", { guarantors: doc });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await guarantorService.addItem(req.params.certificateId as string, req.body);
      sendSuccess(res, "Guarantor item added successfully", { guarantors: doc }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await guarantorService.updateItem(
        req.params.certificateId as string,
        req.params.itemId as string,
        req.body
      );
      sendSuccess(res, "Guarantor item updated successfully", { guarantors: doc });
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await guarantorService.deleteItem(req.params.certificateId as string, req.params.itemId as string);
      sendSuccess(res, "Guarantor item deleted successfully", { guarantors: doc });
    } catch (error) {
      next(error);
    }
  }
}

export default new GuarantorController();
