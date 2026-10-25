import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/department.controller.js";

const router = Router();

router.get("/", requireAuth, listDepartments);
router.post("/", requireAuth, requireRole("admin"), createDepartment);
router.patch("/:id", requireAuth, requireRole("admin"), updateDepartment);
router.delete("/:id", requireAuth, requireRole("admin"), deleteDepartment);

export default router;
