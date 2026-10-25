import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { departments, students, teachers, courses } from "../db/schema.js";
import { createDepartmentSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listDepartments(_req: Request, res: Response) {
  const [allDepts, allStudents, allTeachers, allCourses] = await Promise.all([
    db.select().from(departments),
    db.select().from(students),
    db.select().from(teachers),
    db.select().from(courses),
  ]);

  const rows = allDepts.map((d) => ({
    ...d,
    studentCount: allStudents.filter((s) => s.departmentId === d.id).length,
    teacherCount: allTeachers.filter((t) => t.departmentId === d.id).length,
    courseCount: allCourses.filter((c) => c.departmentId === d.id).length,
  }));

  res.json(rows);
}

export async function createDepartment(req: Request, res: Response) {
  const data = createDepartmentSchema.parse(req.body);
  const [row] = await db.insert(departments).values(data).returning();
  res.status(201).json(row);
}

export async function updateDepartment(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = createDepartmentSchema.partial().parse(req.body);
  const [row] = await db.update(departments).set(data).where(eq(departments.id, id)).returning();
  if (!row) throw new ApiError(404, "Department not found.");
  res.json(row);
}

export async function deleteDepartment(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [row] = await db.delete(departments).where(eq(departments.id, id)).returning();
  if (!row) throw new ApiError(404, "Department not found.");
  res.status(204).send();
}
