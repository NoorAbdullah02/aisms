import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listStudents,
  getStudent,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  batchGenerateStudentEmails,
} from "../controllers/student.controller.js";

const router = Router();

router.get("/me", requireAuth, requireRole("student"), getMyStudentProfile);
router.get("/", requireAuth, requireRole("admin", "teacher"), listStudents);
router.post("/generate-emails", requireAuth, requireRole("admin"), batchGenerateStudentEmails);
router.get("/:id", requireAuth, requireRole("admin", "teacher"), getStudent);
router.post("/", requireAuth, requireRole("admin"), createStudent);
router.patch("/:id", requireAuth, requireRole("admin"), updateStudent);
router.delete("/:id", requireAuth, requireRole("admin"), deleteStudent);

export default router;
