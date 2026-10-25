import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { results, students, teachers, courses, users } from "../db/schema.js";
import { createResultSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { emitEvent } from "../socket.js";
import { recordAudit } from "../utils/audit.js";
import { sendEmail } from "../utils/email.js";

// FR-10: Teachers upload marks and generate GPA automatically.
export async function createResult(req: Request, res: Response) {
  const data = createResultSchema.parse(req.body);

  const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, req.user!.sub)).limit(1);
  const teacherId = teacher?.id ?? null;

  const [row] = await db
    .insert(results)
    .values({
      studentId: data.studentId,
      courseId: data.courseId,
      marks: data.marks.toFixed(2),
      gradePoint: data.gradePoint.toFixed(2),
      semester: data.semester,
      publishedByTeacherId: teacherId,
    })
    .onConflictDoUpdate({
      target: [results.studentId, results.courseId, results.semester],
      set: { marks: data.marks.toFixed(2), gradePoint: data.gradePoint.toFixed(2), publishedByTeacherId: teacherId },
    })
    .returning();

  recordAudit(req.user!.sub, "result.published", { resultId: row!.id, studentId: data.studentId, courseId: data.courseId });
  emitEvent(`user:${data.studentId}`, "result:published", row);

  // Email Notification to Student via Brevo API
  db.select({ email: users.email, fullName: users.fullName })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.id, data.studentId))
    .limit(1)
    .then(([stu]) => {
      if (stu) {
        sendEmail({
          to: stu.email,
          toName: stu.fullName,
          subject: "AISMS Grade Result Published",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h3 style="color: #2563eb; margin-top: 0;">New Exam Grade Published</h3>
              <p>Hello <strong>${stu.fullName}</strong>,</p>
              <p>Your academic result for <strong>Semester ${data.semester}</strong> has been published.</p>
              <ul style="background: #f8fafc; padding: 15px 25px; border-radius: 8px; list-style: none;">
                <li><strong>Marks Scored:</strong> ${data.marks.toFixed(2)}</li>
                <li><strong>Grade Point:</strong> ${data.gradePoint.toFixed(2)}</li>
              </ul>
              <p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app/results" style="color: #2563eb;">AISMS Results Portal</a> to view your full transcript.</p>
            </div>
          `,
        }).catch(() => {});
      }
    })
    .catch(() => {});

  res.status(201).json(row);
}

export async function getStudentResults(req: Request, res: Response) {
  const studentId = Number(req.params.studentId);
  const rows = await db
    .select({
      id: results.id,
      marks: results.marks,
      gradePoint: results.gradePoint,
      semester: results.semester,
      courseTitle: courses.title,
      courseCode: courses.code,
      credits: courses.credits,
    })
    .from(results)
    .innerJoin(courses, eq(results.courseId, courses.id))
    .where(eq(results.studentId, studentId));
  res.json(rows);
}

// FR-11: Students download semester transcripts
export async function getMyResults(req: Request, res: Response) {
  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");

  const rows = await db
    .select({
      id: results.id,
      marks: results.marks,
      gradePoint: results.gradePoint,
      semester: results.semester,
      courseTitle: courses.title,
      courseCode: courses.code,
      credits: courses.credits,
    })
    .from(results)
    .innerJoin(courses, eq(results.courseId, courses.id))
    .where(eq(results.studentId, student.id));

  const totalCredits = rows.reduce((sum, r) => sum + r.credits, 0);
  const weightedGpa = totalCredits
    ? rows.reduce((sum, r) => sum + Number(r.gradePoint) * r.credits, 0) / totalCredits
    : 0;

  res.json({ studentId: student.id, cgpa: Math.round(weightedGpa * 100) / 100, results: rows });
}

export async function getCourseResults(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const rows = await db
    .select({
      id: results.id,
      studentId: results.studentId,
      studentCode: students.studentCode,
      studentName: users.fullName,
      marks: results.marks,
      gradePoint: results.gradePoint,
      semester: results.semester,
      createdAt: results.createdAt,
    })
    .from(results)
    .innerJoin(students, eq(results.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(results.courseId, courseId));

  res.json(rows);
}

export async function updateResult(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = createResultSchema.partial().parse(req.body);
  const updatePayload: any = {};
  if (data.marks !== undefined) updatePayload.marks = data.marks.toFixed(2);
  if (data.gradePoint !== undefined) updatePayload.gradePoint = data.gradePoint.toFixed(2);
  if (data.semester !== undefined) updatePayload.semester = data.semester;

  const [row] = await db.update(results).set(updatePayload).where(eq(results.id, id)).returning();
  if (!row) throw new ApiError(404, "Result not found.");
  res.json(row);
}

export async function deleteResult(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [row] = await db.delete(results).where(eq(results.id, id)).returning();
  if (!row) throw new ApiError(404, "Result not found.");
  res.status(204).send();
}
