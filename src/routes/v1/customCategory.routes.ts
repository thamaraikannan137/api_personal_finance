import { Router } from "express";
import customCategoryTemplateController from "../../controllers/customCategoryTemplate.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createCustomCategoryTemplateSchema,
  updateCustomCategoryTemplateSchema,
} from "../../validators/customCategoryTemplate.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", customCategoryTemplateController.getTemplates);
router.post(
  "/",
  validate(createCustomCategoryTemplateSchema),
  customCategoryTemplateController.createTemplate
);
router.put(
  "/:id",
  validate(updateCustomCategoryTemplateSchema),
  customCategoryTemplateController.updateTemplate
);
router.delete("/:id", customCategoryTemplateController.deleteTemplate);

export default router;


