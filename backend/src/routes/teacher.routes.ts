import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listTeachers, createTeacher, deleteTeacher, batchGenerateTeacherEmails } from "../controllers/teacher.controller.js";

const router = Router();

router.get("/", requireAuth, listTeachers);
router.post("/generate-emails", requireAuth, requireRole("admin"), batchGenerateTeacherEmails);
router.post("/", requireAuth, requireRole("admin"), createTeacher);
router.delete("/:id", requireAuth, requireRole("admin"), deleteTeacher);

export default router;
