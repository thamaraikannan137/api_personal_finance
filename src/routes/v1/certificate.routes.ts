import { Router } from "express";
import certificateController from "../../controllers/certificate.controller.js";
import annexure1Controller from "../../controllers/annexure1.controller.js";
import annexure2Controller from "../../controllers/annexure2.controller.js";
import certificateLiabilityController from "../../controllers/certificateLiability.controller.js";
import guarantorController from "../../controllers/guarantor.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createCertificateSchema } from "../../validators/certificate.validator.js";

const router = Router();

router.use(authenticate);

// Certificate CRUD
router.post("/", validate(createCertificateSchema), certificateController.createCertificate);
router.get("/:id", certificateController.getCertificateById);
router.patch("/:id/finalize", certificateController.finalizeCertificate);
router.patch("/:id/reopen", certificateController.reopenCertificate);
router.delete("/:id", certificateController.deleteCertificate);
router.get("/:id/summary", certificateController.getSummary);
router.get("/:id/export/excel", certificateController.exportExcel);

// Annexure-1 — nested under certificate
router.get("/:certificateId/annexure1", annexure1Controller.getAnnexure1);
router.put("/:certificateId/annexure1", annexure1Controller.saveAll);
router.post("/:certificateId/annexure1/:section", annexure1Controller.addRow);
router.put("/:certificateId/annexure1/:section/:rowId", annexure1Controller.updateRow);
router.delete("/:certificateId/annexure1/:section/:rowId", annexure1Controller.deleteRow);

// Annexure-2 — nested under certificate
router.get("/:certificateId/annexure2", annexure2Controller.getAnnexure2);
router.put("/:certificateId/annexure2", annexure2Controller.saveAll);
router.put("/:certificateId/annexure2/:section", annexure2Controller.updateSection);

// Liabilities — nested under certificate
router.get("/:certificateId/liabilities", certificateLiabilityController.getLiabilities);
router.put("/:certificateId/liabilities", certificateLiabilityController.saveAll);
router.post("/:certificateId/liabilities/item", certificateLiabilityController.addItem);
router.put("/:certificateId/liabilities/item/:itemId", certificateLiabilityController.updateItem);
router.delete("/:certificateId/liabilities/item/:itemId", certificateLiabilityController.deleteItem);

// Guarantors — nested under certificate
router.get("/:certificateId/guarantors", guarantorController.getGuarantors);
router.put("/:certificateId/guarantors", guarantorController.saveAll);
router.post("/:certificateId/guarantors/item", guarantorController.addItem);
router.put("/:certificateId/guarantors/item/:itemId", guarantorController.updateItem);
router.delete("/:certificateId/guarantors/item/:itemId", guarantorController.deleteItem);

export default router;
