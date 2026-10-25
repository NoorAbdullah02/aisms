import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listNotices, createNotice, deleteNotice } from "../controllers/notice.controller.js";

const router = Router();

router.get("/", requireAuth, listNotices);
router.post("/", requireAuth, requireRole("admin", "teacher"), createNotice);
router.delete("/:id", requireAuth, requireRole("admin", "teacher"), deleteNotice);

export default router;
