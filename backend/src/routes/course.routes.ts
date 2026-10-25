import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { enrollments, students, courses } from "../db/schema.js";
import { listCourses, createCourse, updateCourse, deleteCourse, getCourseStudents } from "../controllers/course.controller.js";
import { enrollCourseSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, listCourses);
router.get("/:id/students", requireAuth, requireRole("admin", "teacher"), getCourseStudents);
router.post("/", requireAuth, requireRole("admin"), createCourse);
router.patch("/:id", requireAuth, requireRole("admin"), updateCourse);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCourse);

// FR-07: Students register for courses online each semester.
router.post("/register", requireAuth, requireRole("student"), async (req, res) => {
  const { courseId } = enrollCourseSchema.parse(req.body);

  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) throw new ApiError(404, "Course not found.");

  const [existing] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, student.id), eq(enrollments.courseId, courseId)))
    .limit(1);
  if (existing) throw new ApiError(409, "Already registered for this course.");

  const [row] = await db.insert(enrollments).values({ studentId: student.id, courseId }).returning();
  res.status(201).json(row);
});

router.get("/my-enrollments", requireAuth, requireRole("student"), async (req, res) => {
  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");

  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: courses.id,
      title: courses.title,
      code: courses.code,
      credits: courses.credits,
      semester: courses.semester,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, student.id));

  res.json(rows);
});

export default router;
