import { Router } from "express";
import userController from "../../controllers/user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../../config/constants.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.put("/:id", userController.updateUser);

router.delete(
  "/:id",
  authorize(USER_ROLES.ADMIN),
  userController.deleteUser
);

export default router;
