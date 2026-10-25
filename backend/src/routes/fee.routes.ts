import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listFees, getMyFees, createFee, updateFeeStatus } from "../controllers/fee.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), listFees);
router.get("/me", requireAuth, requireRole("student"), getMyFees);
router.post("/", requireAuth, requireRole("admin"), createFee);
router.patch("/:id/status", requireAuth, requireRole("admin", "student"), updateFeeStatus);

export default router;
