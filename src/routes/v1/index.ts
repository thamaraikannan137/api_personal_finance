import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import clientRoutes from "./client.routes.js";
import certificateRoutes from "./certificate.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/certificates", certificateRoutes);

export default router;
