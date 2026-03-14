import { Router } from "express";
import multer from "multer";
import clientController from "../../controllers/client.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createClientSchema, updateClientSchema } from "../../validators/client.validator.js";
import certificateController from "../../controllers/certificate.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get("/", clientController.getClients);
router.post("/", validate(createClientSchema), clientController.createClient);
router.post("/import", upload.single("file"), clientController.importClients);
router.get("/:id", clientController.getClientById);
router.put("/:id", validate(updateClientSchema), clientController.updateClient);
router.delete("/:id", clientController.deleteClient);
router.get("/:clientId/certificates", certificateController.getCertificatesByClient);

export default router;
