import type { Response, NextFunction } from "express";
import certificateService from "../services/certificateService.js";
import exportService from "../services/exportService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class CertificateController {
  async createCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const { clientId, financialYear, asOnDate } = req.body;
      const cert = await certificateService.createCertificate(
        req.user.userId,
        clientId as string,
        financialYear as string,
        asOnDate as string
      );
      sendSuccess(res, "Certificate created successfully", { certificate: cert }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getCertificateById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const cert = await certificateService.getCertificateById(req.params["id"] as string, req.user.userId);
      sendSuccess(res, "Certificate retrieved successfully", { certificate: cert });
    } catch (error) {
      next(error);
    }
  }

  async getCertificatesByClient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const clientId = req.params.clientId as string;
      const status = req.query.status as string | undefined;
      const certs = await certificateService.getCertificatesByClient(
        clientId,
        req.user.userId,
        status
      );
      sendSuccess(res, "Certificates retrieved successfully", { certificates: certs });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const summary = await certificateService.getSummary(req.params.id as string, req.user.userId);
      sendSuccess(res, "Summary retrieved successfully", { summary });
    } catch (error) {
      next(error);
    }
  }

  async finalizeCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const cert = await certificateService.finalizeCertificate(req.params.id as string, req.user.userId);
      sendSuccess(res, "Certificate finalized successfully", { certificate: cert });
    } catch (error) {
      next(error);
    }
  }

  async reopenCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const cert = await certificateService.reopenCertificate(req.params.id as string, req.user.userId);
      sendSuccess(res, "Certificate reopened successfully", { certificate: cert });
    } catch (error) {
      next(error);
    }
  }

  async deleteCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      await certificateService.deleteCertificate(req.params.id as string, req.user.userId);
      sendSuccess(res, "Certificate deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const buffer = await exportService.generateExcel(req.params.id as string, req.user.userId);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="net-worth-${req.params.id}.xlsx"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new CertificateController();
