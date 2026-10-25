import type { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { attendance, students, teachers } from "../db/schema.js";
import { markAttendanceSchema, bulkAttendanceSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { emitEvent } from "../socket.js";

async function findTeacherId(userId: number): Promise<number | null> {
  const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return teacher?.id ?? null;
}

// FR-08: Teachers & Admins record attendance digitally.
export async function markAttendance(req: Request, res: Response) {
  const data = markAttendanceSchema.parse(req.body);
  const teacherId = await findTeacherId(req.user!.sub);

  const [row] = await db
    .insert(attendance)
    .values({ ...data, markedByTeacherId: teacherId })
    .onConflictDoUpdate({
      target: [attendance.studentId, attendance.courseId, attendance.date],
      set: { status: data.status, markedByTeacherId: teacherId },
    })
    .returning();

  emitEvent(`user:${data.studentId}`, "attendance:marked", row);
  res.status(201).json(row);
}

export async function markBulkAttendance(req: Request, res: Response) {
  const data = bulkAttendanceSchema.parse(req.body);
  const teacherId = await findTeacherId(req.user!.sub);

  const rows = await Promise.all(
    data.records.map((r) =>
      db
        .insert(attendance)
        .values({ studentId: r.studentId, courseId: data.courseId, date: data.date, status: r.status, markedByTeacherId: teacherId })
        .onConflictDoUpdate({
          target: [attendance.studentId, attendance.courseId, attendance.date],
          set: { status: r.status, markedByTeacherId: teacherId },
        })
        .returning()
    )
  );

  for (const [row] of rows) {
    if (row) emitEvent(`user:${row.studentId}`, "attendance:marked", row);
  }
  res.status(201).json(rows.flat());
}

// FR-09: Students view attendance percentage and history.
export async function getStudentAttendance(req: Request, res: Response) {
  const studentId = Number(req.params.studentId);

  const rows = await db.select().from(attendance).where(eq(attendance.studentId, studentId));

  const total = rows.length;
  const present = rows.filter((r) => r.status === "present" || r.status === "late").length;
  const percentage = total === 0 ? 100 : Math.round((present / total) * 10000) / 100;

  res.json({ studentId, total, present, percentage, history: rows });
}

export async function getMyAttendance(req: Request, res: Response) {
  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");

  const rows = await db.select().from(attendance).where(eq(attendance.studentId, student.id));
  const total = rows.length;
  const present = rows.filter((r) => r.status === "present" || r.status === "late").length;
  const percentage = total === 0 ? 100 : Math.round((present / total) * 10000) / 100;

  res.json({ studentId: student.id, total, present, percentage, history: rows });
}

export async function getCourseAttendanceOnDate(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const date = req.query.date as string;
  if (!date) throw new ApiError(400, "date query param is required (YYYY-MM-DD).");

  const rows = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.courseId, courseId), eq(attendance.date, date)));
  res.json(rows);
}
