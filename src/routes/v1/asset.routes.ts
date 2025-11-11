import { Router } from "express";
import assetController from "../../controllers/asset.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createAssetSchema,
  updateAssetSchema,
} from "../../validators/asset.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/assets - Get all assets for the authenticated user
router.get("/", assetController.getAssets);

// GET /api/v1/assets/summary - Get asset summary (total value, by category)
router.get("/summary", assetController.getAssetSummary);

// GET /api/v1/assets/:id - Get asset by ID
router.get("/:id", assetController.getAssetById);

// POST /api/v1/assets - Create new asset
router.post("/", validate(createAssetSchema), assetController.createAsset);

// PUT /api/v1/assets/:id - Update asset
router.put("/:id", validate(updateAssetSchema), assetController.updateAsset);

// DELETE /api/v1/assets/:id - Delete asset
router.delete("/:id", assetController.deleteAsset);

export default router;

