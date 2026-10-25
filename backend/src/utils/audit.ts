import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

/**
 * Writes an audit trail entry (NFR-17). Fire-and-forget: audit logging must
 * never block or fail the primary request, so errors are swallowed and logged.
 */
export function recordAudit(userId: number | null, action: string, metadata?: Record<string, unknown>): void {
  db.insert(auditLogs)
    .values({
      userId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .catch((err: unknown) => {
      console.error("Failed to write audit log:", err);
    });
}
