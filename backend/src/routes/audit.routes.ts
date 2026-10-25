import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { auditLogs, users } from "../db/schema.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      actorName: users.fullName,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);
  res.json(rows);
});

export default router;
