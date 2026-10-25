import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { courses, departments, teachers, users, enrollments, students } from "../db/schema.js";
import { createCourseSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listCourses(_req: Request, res: Response) {
  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      code: courses.code,
      credits: courses.credits,
      semester: courses.semester,
      capacity: courses.capacity,
      departmentId: courses.departmentId,
      departmentName: departments.name,
      departmentCode: departments.code,
      teacherId: courses.teacherId,
      teacherName: users.fullName,
      teacherEmail: users.email,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .leftJoin(departments, eq(courses.departmentId, departments.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id));

  const allEnrollments = await db.select().from(enrollments);

  const rows = allCourses.map((c) => ({
    ...c,
    enrolledCount: allEnrollments.filter((e) => e.courseId === c.id).length,
  }));

  res.json(rows);
}

export async function getCourseStudents(req: Request, res: Response) {
  const courseId = Number(req.params.id);
  const rows = await db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      semester: students.semester,
      status: students.status,
      fullName: users.fullName,
      email: users.email,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, courseId));

  res.json(rows);
}

export async function createCourse(req: Request, res: Response) {
  const data = createCourseSchema.parse(req.body);
  const [row] = await db.insert(courses).values(data).returning();
  res.status(201).json(row);
}

export async function updateCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = createCourseSchema.partial().parse(req.body);
  const [row] = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
  if (!row) throw new ApiError(404, "Course not found.");
  res.json(row);
}

export async function deleteCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [row] = await db.delete(courses).where(eq(courses.id, id)).returning();
  if (!row) throw new ApiError(404, "Course not found.");
  res.status(204).send();
}
