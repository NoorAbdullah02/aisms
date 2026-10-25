import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createResult,
  getStudentResults,
  getMyResults,
  getCourseResults,
  updateResult,
  deleteResult,
} from "../controllers/result.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("admin", "teacher"), createResult);
router.get("/me", requireAuth, requireRole("student"), getMyResults);
router.get("/course/:courseId", requireAuth, requireRole("admin", "teacher"), getCourseResults);
router.get("/student/:studentId", requireAuth, requireRole("admin", "teacher"), getStudentResults);
router.patch("/:id", requireAuth, requireRole("admin", "teacher"), updateResult);
router.delete("/:id", requireAuth, requireRole("admin", "teacher"), deleteResult);

export default router;
