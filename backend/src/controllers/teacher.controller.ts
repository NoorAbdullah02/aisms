import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { teachers, users, departments } from "../db/schema.js";
import { createTeacherSchema } from "../validators/schemas.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../middleware/errorHandler.js";
import { sendEmail } from "../utils/email.js";

export async function listTeachers(_req: Request, res: Response) {
  const rows = await db
    .select({
      id: teachers.id,
      userId: users.id,
      employeeCode: teachers.employeeCode,
      designation: teachers.designation,
      phone: teachers.phone,
      departmentId: teachers.departmentId,
      departmentName: departments.name,
      departmentCode: departments.code,
      employmentType: teachers.employmentType,
      contractEndDate: teachers.contractEndDate,
      fullName: users.fullName,
      email: users.email,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .leftJoin(departments, eq(teachers.departmentId, departments.id));
  res.json(rows);
}

export async function createTeacher(req: Request, res: Response) {
  const data = createTeacherSchema.parse(req.body);
  const rawBody = req.body as any;

  const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing) throw new ApiError(409, "A user with this email already exists.");

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({ fullName: data.fullName, email: data.email, passwordHash, role: "teacher" })
    .returning();

  const [teacher] = await db
    .insert(teachers)
    .values({
      userId: user!.id,
      departmentId: data.departmentId,
      employeeCode: data.employeeCode,
      designation: data.designation,
      phone: data.phone,
      employmentType: rawBody.employmentType || "Permanent",
      contractEndDate: rawBody.contractEndDate || null,
    })
    .returning();

  // Send Welcome Email via Brevo API
  sendEmail({
    to: data.email,
    toName: data.fullName,
    subject: "Welcome to AISMS — Faculty Teacher Account Initialized",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to Faculty Staff Portal!</h2>
        <p>Hello <strong>${data.fullName}</strong>,</p>
        <p>Your faculty teacher account has been initialized. Account details:</p>
        <ul style="background: #f8fafc; padding: 15px 25px; border-radius: 8px; list-style: none;">
          <li><strong>Employee Code:</strong> ${data.employeeCode}</li>
          <li><strong>Designation:</strong> ${data.designation || "Faculty Member"}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Temporary Password:</strong> ${data.password}</li>
        </ul>
        <p>Log in at <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="color: #2563eb;">AISMS Portal</a>.</p>
      </div>
    `,
  }).catch(() => {});

  res.status(201).json({ ...teacher, fullName: user!.fullName, email: user!.email });
}

export async function deleteTeacher(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  if (!teacher) throw new ApiError(404, "Teacher not found.");
  await db.delete(users).where(eq(users.id, teacher.userId));
  res.status(204).send();
}

export function buildTeacherEmail(fullName: string, code?: string): string {
  const cleanName = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  if (!cleanName) {
    const codeClean = (code || "faculty").toLowerCase().replace(/[^a-z0-9]+/g, "");
    return `${codeClean}@faculty.aisms.edu.bd`;
  }
  return `${cleanName}@faculty.aisms.edu.bd`;
}

export async function batchGenerateTeacherEmails(req: Request, res: Response) {
  const allTeachers = await db
    .select({
      teacherId: teachers.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      employeeCode: teachers.employeeCode,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));

  let updatedCount = 0;
  for (const t of allTeachers) {
    const generated = buildTeacherEmail(t.fullName, t.employeeCode);
    if (t.email !== generated) {
      await db.update(users).set({ email: generated, updatedAt: new Date() }).where(eq(users.id, t.userId));
      updatedCount++;
    }
  }

  res.json({ message: `Successfully generated institutional emails for ${updatedCount} faculty member(s).`, updatedCount });
}
