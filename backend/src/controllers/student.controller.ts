import type { Request, Response } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { students, users, departments } from "../db/schema.js";
import { createStudentSchema, updateStudentSchema } from "../validators/schemas.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../middleware/errorHandler.js";
import { recordAudit } from "../utils/audit.js";
import { sendEmail } from "../utils/email.js";

export async function listStudents(req: Request, res: Response) {
  const search = (req.query.q as string | undefined)?.trim();

  const base = db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      semester: students.semester,
      departmentId: students.departmentId,
      departmentName: departments.name,
      departmentCode: departments.code,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,
      status: students.status,
      graduationDate: students.graduationDate,
      fullName: users.fullName,
      email: users.email,
      userId: users.id,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(departments, eq(students.departmentId, departments.id));

  const rows = search
    ? await base.where(or(ilike(users.fullName, `%${search}%`), ilike(students.studentCode, `%${search}%`)))
    : await base;

  res.json(rows);
}

export async function getStudent(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [row] = await db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      semester: students.semester,
      departmentId: students.departmentId,
      departmentName: departments.name,
      departmentCode: departments.code,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,
      status: students.status,
      graduationDate: students.graduationDate,
      fullName: users.fullName,
      email: users.email,
      userId: users.id,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(departments, eq(students.departmentId, departments.id))
    .where(eq(students.id, id))
    .limit(1);
  if (!row) throw new ApiError(404, "Student not found.");
  res.json(row);
}

export async function getMyStudentProfile(req: Request, res: Response) {
  const [row] = await db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      semester: students.semester,
      departmentId: students.departmentId,
      status: students.status,
      graduationDate: students.graduationDate,
      fullName: users.fullName,
      email: users.email,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, req.user!.sub))
    .limit(1);
  if (!row) throw new ApiError(404, "Student profile not found for current user.");
  res.json(row);
}

export async function createStudent(req: Request, res: Response) {
  const data = createStudentSchema.parse(req.body);
  const bodyStatus = (req.body as any).status || "active";
  const bodyGraduationDate = (req.body as any).graduationDate || null;

  const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing) throw new ApiError(409, "A user with this email already exists.");

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({ fullName: data.fullName, email: data.email, passwordHash, role: "student" })
    .returning();

  const [student] = await db
    .insert(students)
    .values({
      userId: user!.id,
      departmentId: data.departmentId,
      studentCode: data.studentCode,
      semester: data.semester,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      status: bodyStatus,
      graduationDate: bodyGraduationDate,
    })
    .returning();

  recordAudit(req.user!.sub, "student.created", { studentId: student!.id, studentCode: student!.studentCode });

  // Send Welcome Email via Brevo API
  sendEmail({
    to: data.email,
    toName: data.fullName,
    subject: "Welcome to AISMS — Student Portal Account Created",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to AISMS Portal!</h2>
        <p>Hello <strong>${data.fullName}</strong>,</p>
        <p>Your student account has been registered. Account details:</p>
        <ul style="background: #f8fafc; padding: 15px 25px; border-radius: 8px; list-style: none;">
          <li><strong>Student Code:</strong> ${data.studentCode}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Temporary Password:</strong> ${data.password}</li>
        </ul>
        <p>Please log in at <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="color: #2563eb;">AISMS Login</a> and update your password in Settings.</p>
      </div>
    `,
  }).catch(() => {});

  res.status(201).json({ ...student, fullName: user!.fullName, email: user!.email });
}

export async function updateStudent(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = updateStudentSchema.parse(req.body);
  const { fullName, ...studentFields } = data;
  const rawBody = req.body as any;

  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!student) throw new ApiError(404, "Student not found.");

  const updateData: any = { ...studentFields };
  if (rawBody.status) updateData.status = rawBody.status;
  if (rawBody.graduationDate !== undefined) updateData.graduationDate = rawBody.graduationDate;

  if (Object.keys(updateData).length > 0) {
    await db.update(students).set(updateData).where(eq(students.id, id));
  }
  if (fullName) {
    await db.update(users).set({ fullName, updatedAt: new Date() }).where(eq(users.id, student.userId));
  }

  const [updated] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  res.json(updated);
}

export async function deleteStudent(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!student) throw new ApiError(404, "Student not found.");
  await db.delete(users).where(eq(users.id, student.userId));
  recordAudit(req.user!.sub, "student.deleted", { studentId: id });
  res.status(204).send();
}

export function buildStudentEmail(fullName: string, code?: string): string {
  const cleanName = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  if (!cleanName) {
    const codeClean = (code || "student").toLowerCase().replace(/[^a-z0-9]+/g, "");
    return `${codeClean}@student.aisms.edu.bd`;
  }
  return `${cleanName}@student.aisms.edu.bd`;
}

export async function batchGenerateStudentEmails(req: Request, res: Response) {
  const allStudents = await db
    .select({
      studentId: students.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      studentCode: students.studentCode,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));

  let updatedCount = 0;
  for (const s of allStudents) {
    const generated = buildStudentEmail(s.fullName, s.studentCode);
    if (s.email !== generated) {
      await db.update(users).set({ email: generated, updatedAt: new Date() }).where(eq(users.id, s.userId));
      updatedCount++;
    }
  }

  recordAudit(req.user!.sub, "student.emails_batch_generated", { count: updatedCount });
  res.json({ message: `Successfully generated institutional emails for ${updatedCount} student(s).`, updatedCount });
}
