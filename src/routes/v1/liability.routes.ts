import { Router } from "express";
import liabilityController from "../../controllers/liability.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createLiabilitySchema,
  updateLiabilitySchema,
} from "../../validators/liability.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/liabilities - Get all liabilities for the authenticated user
router.get("/", liabilityController.getLiabilities);

// GET /api/v1/liabilities/summary - Get liability summary (total balance, by category)
router.get("/summary", liabilityController.getLiabilitySummary);

// GET /api/v1/liabilities/:id - Get liability by ID
router.get("/:id", liabilityController.getLiabilityById);

// POST /api/v1/liabilities - Create new liability
router.post("/", validate(createLiabilitySchema), liabilityController.createLiability);

// PUT /api/v1/liabilities/:id - Update liability
router.put("/:id", validate(updateLiabilitySchema), liabilityController.updateLiability);

// DELETE /api/v1/liabilities/:id - Delete liability
router.delete("/:id", liabilityController.deleteLiability);

export default router;

