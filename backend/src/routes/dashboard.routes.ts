import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getAdminOverview, getTeacherOverview } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/admin", requireAuth, requireRole("admin"), getAdminOverview);
router.get("/teacher", requireAuth, requireRole("teacher"), getTeacherOverview);

export default router;
