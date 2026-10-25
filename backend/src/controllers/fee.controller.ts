import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { fees, students, users } from "../db/schema.js";
import { createFeeSchema, updateFeeStatusSchema } from "../validators/fee.schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { recordAudit } from "../utils/audit.js";
import { emitEvent } from "../socket.js";
import { sendEmail } from "../utils/email.js";

export async function listFees(_req: Request, res: Response) {
  const rows = await db
    .select({
      id: fees.id,
      title: fees.title,
      amount: fees.amount,
      semester: fees.semester,
      dueDate: fees.dueDate,
      status: fees.status,
      paidAt: fees.paidAt,
      studentId: fees.studentId,
      studentCode: students.studentCode,
    })
    .from(fees)
    .innerJoin(students, eq(fees.studentId, students.id));
  res.json(rows);
}

export async function getMyFees(req: Request, res: Response) {
  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");
  const rows = await db.select().from(fees).where(eq(fees.studentId, student.id));
  res.json(rows);
}

export async function createFee(req: Request, res: Response) {
  const data = createFeeSchema.parse(req.body);
  const [row] = await db
    .insert(fees)
    .values({
      studentId: data.studentId,
      title: data.title,
      amount: data.amount.toFixed(2),
      semester: data.semester,
      dueDate: data.dueDate,
      createdByUserId: req.user!.sub,
    })
    .returning();

  recordAudit(req.user!.sub, "fee.created", { feeId: row!.id, studentId: data.studentId, amount: data.amount });
  emitEvent(`user:${data.studentId}`, "fee:new", row);

  // Email Invoice Notification via Brevo API
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
          subject: `AISMS Fee Invoice Issued: ${data.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h3 style="color: #2563eb; margin-top: 0;">New Fee Invoice Issued</h3>
              <p>Hello <strong>${stu.fullName}</strong>,</p>
              <p>A new fee invoice has been issued for <strong>Semester ${data.semester}</strong>.</p>
              <ul style="background: #f8fafc; padding: 15px 25px; border-radius: 8px; list-style: none;">
                <li><strong>Title:</strong> ${data.title}</li>
                <li><strong>Amount:</strong> $${data.amount.toFixed(2)}</li>
                <li><strong>Due Date:</strong> ${data.dueDate}</li>
              </ul>
              <p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app/fees" style="color: #2563eb;">AISMS Fees Portal</a> to review and process your payment.</p>
            </div>
          `,
        }).catch(() => {});
      }
    })
    .catch(() => {});

  res.status(201).json(row);
}

export async function updateFeeStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { status } = updateFeeStatusSchema.parse(req.body);

  const [row] = await db
    .update(fees)
    .set({ status, paidAt: status === "paid" ? new Date() : null })
    .where(eq(fees.id, id))
    .returning();
  if (!row) throw new ApiError(404, "Fee record not found.");

  recordAudit(req.user!.sub, "fee.status_updated", { feeId: id, status });
  emitEvent(`user:${row.studentId}`, "fee:updated", row);
  res.json(row);
}
