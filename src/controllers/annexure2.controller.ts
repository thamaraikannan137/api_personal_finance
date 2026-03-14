import type { Response, NextFunction } from "express";
import annexure2Service from "../services/annexure2Service.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { IAnnexure2MovableProperty } from "../models/Annexure2MovableProperty.js";

class Annexure2Controller {
  async getAnnexure2(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await annexure2Service.getByCertificate(req.params["certificateId"] as string);
      sendSuccess(res, "Annexure-2 retrieved successfully", { annexure2: doc });
    } catch (error) {
      next(error);
    }
  }

  async saveAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await annexure2Service.saveAll(req.params["certificateId"] as string, req.body);
      sendSuccess(res, "Annexure-2 saved successfully", { annexure2: doc });
    } catch (error) {
      next(error);
    }
  }

  async updateSection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = req.params["section"] as keyof IAnnexure2MovableProperty;
      const doc = await annexure2Service.updateSection(req.params["certificateId"] as string, section, req.body);
      sendSuccess(res, `${String(section)} updated successfully`, { annexure2: doc });
    } catch (error) {
      next(error);
    }
  }
}

export default new Annexure2Controller();
