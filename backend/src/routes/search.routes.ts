import { Router } from "express";
import { ilike, or, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { students, teachers, courses, users, departments } from "../db/schema.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const q = ((req.query.q as string) ?? "").trim();
  if (q.length < 2) {
    res.json({ students: [], teachers: [], courses: [], departments: [] });
    return;
  }
  const like = `%${q}%`;

  const [studentRows, teacherRows, courseRows, departmentRows] = await Promise.all([
    db
      .select({ id: students.id, name: users.fullName, code: students.studentCode })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(or(ilike(users.fullName, like), ilike(students.studentCode, like)))
      .limit(8),
    db
      .select({ id: teachers.id, name: users.fullName, code: teachers.employeeCode })
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(or(ilike(users.fullName, like), ilike(teachers.employeeCode, like)))
      .limit(8),
    db
      .select({ id: courses.id, title: courses.title, code: courses.code })
      .from(courses)
      .where(or(ilike(courses.title, like), ilike(courses.code, like)))
      .limit(8),
    db
      .select({ id: departments.id, name: departments.name, code: departments.code })
      .from(departments)
      .where(or(ilike(departments.name, like), ilike(departments.code, like)))
      .limit(8),
  ]);

  res.json({ students: studentRows, teachers: teacherRows, courses: courseRows, departments: departmentRows });
});

export default router;
