import type { Response, NextFunction } from "express";
import annexure1Service from "../services/annexure1Service.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class Annexure1Controller {
  async getAnnexure1(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await annexure1Service.getByCertificate(req.params["certificateId"] as string);
      sendSuccess(res, "Annexure-1 retrieved successfully", { annexure1: doc });
    } catch (error) {
      next(error);
    }
  }

  async saveAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await annexure1Service.saveAll(req.params["certificateId"] as string, req.body);
      sendSuccess(res, "Annexure-1 saved successfully", { annexure1: doc });
    } catch (error) {
      next(error);
    }
  }

  async addRow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = req.params["section"] as "bySelf" | "bySharing";
      const doc = await annexure1Service.addRow(req.params["certificateId"] as string, section, req.body);
      sendSuccess(res, "Property row added successfully", { annexure1: doc }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateRow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = req.params["section"] as "bySelf" | "bySharing";
      const doc = await annexure1Service.updateRow(
        req.params["certificateId"] as string,
        section,
        req.params["rowId"] as string,
        req.body
      );
      sendSuccess(res, "Property row updated successfully", { annexure1: doc });
    } catch (error) {
      next(error);
    }
  }

  async deleteRow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = req.params["section"] as "bySelf" | "bySharing";
      const doc = await annexure1Service.deleteRow(
        req.params["certificateId"] as string,
        section,
        req.params["rowId"] as string
      );
      sendSuccess(res, "Property row deleted successfully", { annexure1: doc });
    } catch (error) {
      next(error);
    }
  }
}

export default new Annexure1Controller();
