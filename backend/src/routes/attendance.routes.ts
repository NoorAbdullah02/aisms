import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  markAttendance,
  markBulkAttendance,
  getStudentAttendance,
  getMyAttendance,
  getCourseAttendanceOnDate,
} from "../controllers/attendance.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("admin", "teacher"), markAttendance);
router.post("/bulk", requireAuth, requireRole("admin", "teacher"), markBulkAttendance);
router.get("/me", requireAuth, requireRole("student"), getMyAttendance);
router.get("/student/:studentId", requireAuth, requireRole("admin", "teacher"), getStudentAttendance);
router.get("/course/:courseId", requireAuth, requireRole("admin", "teacher"), getCourseAttendanceOnDate);

export default router;
