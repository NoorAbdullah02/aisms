import type { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { notices, users } from "../db/schema.js";
import { createNoticeSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { recordAudit } from "../utils/audit.js";
import { emitEvent } from "../socket.js";
import { sendEmail } from "../utils/email.js";

export async function listNotices(_req: Request, res: Response) {
  const rows = await db.select().from(notices).orderBy(desc(notices.createdAt));
  res.json(rows);
}

export async function createNotice(req: Request, res: Response) {
  const data = createNoticeSchema.parse(req.body);
  const [row] = await db.insert(notices).values({ ...data, createdByUserId: req.user!.sub }).returning();

  recordAudit(req.user!.sub, "notice.created", { noticeId: row!.id, audience: data.audience });
  
  // Real-time push (WebSocket)
  const room = data.audience === "all" ? "all" : `role:${data.audience.slice(0, -1)}`;
  emitEvent(room, "notice:new", row);

  // Email Notification Dispatch via Brevo API
  db.select({ email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.isActive, true))
    .then((activeUsers) => {
      for (const u of activeUsers) {
        sendEmail({
          to: u.email,
          toName: u.fullName,
          subject: `[AISMS Notice] ${data.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h3 style="color: #2563eb; margin-top: 0;">${data.title}</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${data.body}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Audience: ${data.audience} | AISMS Notice Dispatch</p>
            </div>
          `,
        }).catch(() => {});
      }
    })
    .catch(() => {});

  res.status(201).json(row);
}

export async function deleteNotice(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [row] = await db.delete(notices).where(eq(notices.id, id)).returning();
  if (!row) throw new ApiError(404, "Notice not found.");
  res.status(204).send();
}
