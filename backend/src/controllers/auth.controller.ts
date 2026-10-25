import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { loginSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { recordAudit } from "../utils/audit.js";

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
    throw new ApiError(403, "Account access has expired. Please contact Administrator.");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  recordAudit(user.id, "auth.login", { email: user.email, role: user.role });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new ApiError(400, "refreshToken is required.");

  let payload: { sub: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user || !user.isActive) throw new ApiError(401, "User not found.");

  if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
    throw new ApiError(403, "Account access has expired. Please contact Administrator.");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ accessToken });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) throw new ApiError(400, "Email address is required.");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    recordAudit(user.id, "auth.forgot_password_requested", { email });
  }

  res.json({
    message: "If an account matches that email address, password reset instructions have been sent.",
  });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both currentPassword and newPassword are required.");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  recordAudit(user.id, "auth.password_changed", { email: user.email });

  res.json({ message: "Password updated successfully." });
}

export async function updateProfile(req: Request, res: Response) {
  const { fullName, avatarUrl } = req.body as { fullName?: string; avatarUrl?: string };
  const userId = req.user!.sub;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");

  const updateData: any = { updatedAt: new Date() };
  if (fullName && fullName.trim()) updateData.fullName = fullName.trim();
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  await db.update(users).set(updateData).where(eq(users.id, userId));

  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  recordAudit(userId, "auth.profile_updated", { fullName, avatarUrl });

  res.json({ id: updated!.id, fullName: updated!.fullName, email: updated!.email, role: updated!.role, avatarUrl: updated!.avatarUrl });
}

export async function me(req: Request, res: Response) {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl });
}

export async function logout(_req: Request, res: Response) {
  res.status(204).send();
}

export async function adminResetPassword(req: Request, res: Response) {
  const { userId, newPassword } = req.body as { userId?: number; newPassword?: string };
  if (!userId || !newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Valid userId and newPassword (min 6 chars) are required.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError(404, "User account not found.");

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  recordAudit(req.user!.sub, "admin.password_reset", { targetUserId: userId, targetEmail: user.email });
  res.json({ message: `Password for ${user.fullName} (${user.email}) reset successfully.` });
}
