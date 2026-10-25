import { Router, type Response } from "express";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { students, users, attendance, results, courses, teachers, departments, fees } from "../db/schema.js";
import { toCsv } from "../utils/csv.js";

const router = Router();

function sendCsv(res: Response, filename: string, rows: Array<Record<string, unknown>>) {
  const csv = toCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

// FR-19: administrators generate exportable attendance, result, and student reports.
router.get("/students", requireAuth, requireRole("admin", "teacher"), async (_req, res) => {
  const rows = await db
    .select({
      studentCode: students.studentCode,
      fullName: users.fullName,
      email: users.email,
      semester: students.semester,
      status: students.status,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));
  sendCsv(res, "students.csv", rows);
});

router.get("/teachers", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await db
    .select({
      employeeCode: teachers.employeeCode,
      fullName: users.fullName,
      email: users.email,
      designation: teachers.designation,
      employmentType: teachers.employmentType,
      phone: teachers.phone,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));
  sendCsv(res, "teachers.csv", rows);
});

router.get("/courses", requireAuth, requireRole("admin", "teacher"), async (_req, res) => {
  const rows = await db
    .select({
      code: courses.code,
      title: courses.title,
      credits: courses.credits,
      semester: courses.semester,
      capacity: courses.capacity,
    })
    .from(courses);
  sendCsv(res, "courses.csv", rows);
});

router.get("/fees", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await db
    .select({
      feeId: fees.id,
      title: fees.title,
      amount: fees.amount,
      semester: fees.semester,
      dueDate: fees.dueDate,
      status: fees.status,
      paidAt: fees.paidAt,
      studentCode: students.studentCode,
      studentName: users.fullName,
    })
    .from(fees)
    .innerJoin(students, eq(fees.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id));
  sendCsv(res, "fees_report.csv", rows);
});

router.get("/results/:studentId", requireAuth, requireRole("admin", "teacher"), async (req, res) => {
  const studentId = Number(req.params.studentId);
  const rows = await db
    .select({
      courseTitle: courses.title,
      courseCode: courses.code,
      semester: results.semester,
      marks: results.marks,
      gradePoint: results.gradePoint,
    })
    .from(results)
    .innerJoin(courses, eq(results.courseId, courses.id))
    .where(eq(results.studentId, studentId));
  sendCsv(res, `results-student-${studentId}.csv`, rows);
});

router.get("/attendance/:courseId", requireAuth, requireRole("admin", "teacher"), async (req, res) => {
  const courseId = Number(req.params.courseId);
  const rows = await db
    .select({
      studentId: attendance.studentId,
      date: attendance.date,
      status: attendance.status,
    })
    .from(attendance)
    .where(eq(attendance.courseId, courseId));
  sendCsv(res, `attendance-course-${courseId}.csv`, rows);
});

export default router;
