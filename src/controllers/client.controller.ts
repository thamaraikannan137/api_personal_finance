import type { Response, NextFunction } from "express";
import clientService from "../services/clientService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class ClientController {
  async createClient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const client = await clientService.createClient({ ...req.body, auditorId: req.user.userId });
      sendSuccess(res, "Client created successfully", { client }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getClients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const isActiveParam = req.query.isActive as string | undefined;
      const isActive =
        isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;

      const result = await clientService.getClients(req.user.userId, {
        page,
        limit,
        search,
        isActive,
      });
      sendSuccess(res, "Clients retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const client = await clientService.getClientById(req.params.id as string, req.user.userId);
      sendSuccess(res, "Client retrieved successfully", { client });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const client = await clientService.updateClient(req.params["id"] as string, req.user.userId, req.body);
      sendSuccess(res, "Client updated successfully", { client });
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      await clientService.deleteClient(req.params["id"] as string, req.user.userId);
      sendSuccess(res, "Client deactivated successfully");
    } catch (error) {
      next(error);
    }
  }

  async importClients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      const result = await clientService.importFromCSV(req.user.userId, file.buffer);
      sendSuccess(res, "Import complete", result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ClientController();
